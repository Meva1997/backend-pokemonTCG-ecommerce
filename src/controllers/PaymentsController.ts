import { Request, Response } from "express";
import Stripe from "stripe";
import Product from "../models/Product";
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import Payment from "../models/Payment";
import { db } from "../config/db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}
const stripe = new Stripe(stripeSecretKey);

interface CartItem {
  productId: number;
  quantity: number;
}

export class PaymentsController {
  static async createPaymentIntent(req: Request, res: Response) {
    try {
      const {
        products,
        currency = "usd",
        shipping = 0,
        tax = 0,
      }: {
        products: CartItem[];
        currency?: string;
        shipping?: number;
        tax?: number;
      } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        return res
          .status(400)
          .json({ error: "Products array is required and cannot be empty" });
      }

      // Normalize currency to lowercase (Stripe requires lowercase ISO codes, e.g. "usd" not "USD")
      const normalizedCurrency = currency.toLowerCase();

      const authUserId = req.user?.id;
      if (!authUserId) {
        return res.status(401).json({ error: "Authenticated user not found" });
      }

      // Validate all cart items upfront before any DB/Stripe calls
      for (const item of products) {
        if (
          !item.productId ||
          !Number.isInteger(item.productId) ||
          item.productId <= 0
        ) {
          return res
            .status(400)
            .json({ error: "Each item must have a valid productId" });
        }

        if (
          !item.quantity ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          return res.status(400).json({
            error: `Quantity for product ${item.productId} must be a positive integer greater than zero`,
          });
        }
      }

      // Fetch all products in a single query to avoid N+1 pattern
      const productIds = products.map((item) => item.productId);
      const foundProducts = await Product.findAll({
        where: { id: productIds },
      });
      const productMap = new Map(foundProducts.map((p) => [p.id, p]));

      let total = 0;
      const validatedItems: { product: Product; quantity: number }[] = [];

      for (const item of products) {
        const product = productMap.get(item.productId);
        if (!product) {
          return res.status(404).json({
            error: `Product with id ${item.productId} not found`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: `Product "${product.name}" does not have enough stock. Available: ${product.stock}, Requested: ${item.quantity}`,
          });
        }

        total += product.price * item.quantity;
        validatedItems.push({ product, quantity: item.quantity });
      }

      // Add shipping and tax passed from the frontend
      const shippingAmount = Number(shipping);
      const taxAmount = Number(tax);
      if (!Number.isFinite(shippingAmount) || shippingAmount < 0) {
        return res
          .status(400)
          .json({ error: "Shipping must be a non-negative number" });
      }
      if (!Number.isFinite(taxAmount) || taxAmount < 0) {
        return res
          .status(400)
          .json({ error: "Tax must be a non-negative number" });
      }
      total = total + shippingAmount + taxAmount;

      // Stripe amounts are in the smallest currency unit (cents for USD)
      const amountInCents = Math.round(total * 100);

      // Create a pending order in the DB and store only the orderId in Stripe metadata.
      // This avoids embedding potentially large product JSON in metadata (Stripe limits values to 500 chars).
      const pendingOrder = await db.transaction(async (t) => {
        const order = await Order.create(
          {
            userId: authUserId,
            shippingAddress: "",
            total,
            status: "pending",
          },
          { transaction: t },
        );

        for (const item of validatedItems) {
          await OrderProduct.create(
            {
              orderId: order.id,
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            },
            { transaction: t },
          );
        }

        return order;
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: normalizedCurrency,
        metadata: {
          orderId: pendingOrder.id.toString(),
          userId: authUserId.toString(),
        },
      });

      return res.status(201).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
        currency: normalizedCurrency,
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        return res
          .status(error.statusCode ?? 500)
          .json({ error: error.message });
      }
      console.error("[createPaymentIntent]", error);
      return res.status(500).json({ error: "Error creating payment intent" });
    }
  }

  static async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentIntentId, shippingAddress } = req.body;

      if (!paymentIntentId || typeof paymentIntentId !== "string") {
        return res.status(400).json({ error: "paymentIntentId is required" });
      }

      if (!shippingAddress || typeof shippingAddress !== "string") {
        return res.status(400).json({ error: "shippingAddress is required" });
      }

      const authUserId = req.user?.id;
      if (!authUserId) {
        return res.status(401).json({ error: "Authenticated user not found" });
      }

      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (
        paymentIntent.status !== "succeeded" &&
        paymentIntent.status !== "requires_capture"
      ) {
        return res.status(400).json({
          error: `Payment has not been completed. Current status: ${paymentIntent.status}`,
        });
      }

      // Verify that the payment intent was created by the authenticated user
      const intentUserId = paymentIntent.metadata?.userId;
      if (!intentUserId || intentUserId !== authUserId.toString()) {
        return res
          .status(403)
          .json({
            error: "Payment intent does not belong to the authenticated user",
          });
      }

      const rawOrderId = paymentIntent.metadata?.orderId;
      if (!rawOrderId) {
        return res
          .status(400)
          .json({ error: "Payment intent has no associated order" });
      }

      const orderId = Number(rawOrderId);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid order reference in payment intent" });
      }

      // Wrap all DB writes in a transaction with row locking for concurrency safety
      const result = await db.transaction(async (t) => {
        // Lock the pending order row inside the transaction
        const order = await Order.findOne({
          where: { id: orderId, userId: authUserId },
          lock: t.LOCK.UPDATE,
          transaction: t,
        });

        if (!order) {
          throw new Error(
            "Order not found or does not belong to the authenticated user",
          );
        }

        // Guard against double-processing inside the transaction (concurrent requests safe)
        if (order.status !== "pending") {
          throw new Error("Payment has already been processed");
        }

        // Validate that Stripe's charged amount matches the stored order total (price-drift check).
        // Compare cent values directly to avoid floating-point precision issues and currency-specific decimal places.
        const stripeAmountInDollars = paymentIntent.amount / 100;
        if (paymentIntent.amount !== Math.round(order.total * 100)) {
          throw new Error(
            `Payment amount mismatch: Stripe charged ${stripeAmountInDollars}, but order total is ${order.total}`,
          );
        }

        // Fetch the order's products
        const orderProducts = await OrderProduct.findAll({
          where: { orderId: order.id },
          transaction: t,
        });

        // Lock product rows and decrement stock within the transaction
        for (const op of orderProducts) {
          // Validate quantity before using it in the stock update
          const quantity = Number(op.quantity);
          if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(
              `Invalid quantity for product with id ${op.productId}: ${op.quantity}`,
            );
          }

          const product = await Product.findOne({
            where: { id: op.productId },
            lock: t.LOCK.UPDATE,
            transaction: t,
          });

          if (!product) {
            throw new Error(`Product with id ${op.productId} not found`);
          }

          if (product.stock < quantity) {
            throw new Error(
              `Product "${product.name}" no longer has enough stock. Available: ${product.stock}, Requested: ${quantity}`,
            );
          }

          // Decrement stock using the instance method (parameterized, no SQL injection risk).
          // Row is already locked above so the stock check is guaranteed to hold through the update.
          await product.decrement("stock", { by: quantity, transaction: t });
        }

        // Update order with shipping address and mark as paid
        await order.update(
          { shippingAddress, status: "paid" },
          { transaction: t },
        );

        const payment = await Payment.create(
          {
            orderId: order.id,
            method: "card",
            status: "approved",
            amount: stripeAmountInDollars,
            currency: paymentIntent.currency,
            transactionReference: paymentIntent.id,
          },
          { transaction: t },
        );

        return { order, payment };
      });

      return res.status(201).json({
        message: "Payment confirmed and order created successfully",
        orderId: result.order.id,
        paymentId: result.payment.id,
        status: "paid",
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        return res
          .status(error.statusCode ?? 500)
          .json({ error: error.message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Error confirming payment" });
    }
  }
}

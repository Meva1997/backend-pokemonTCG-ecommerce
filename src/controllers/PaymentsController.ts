import { Request, Response } from "express";
import Stripe from "stripe";
import { Op, literal } from "sequelize";
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
      }: { products: CartItem[]; currency?: string } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        return res
          .status(400)
          .json({ error: "Products array is required and cannot be empty" });
      }

      let total = 0;
      const validatedItems: { product: Product; quantity: number }[] = [];

      for (const item of products) {
        if (!item.productId || !Number.isInteger(item.productId) || item.productId <= 0) {
          return res.status(400).json({ error: "Each item must have a valid productId" });
        }

        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          return res.status(400).json({
            error: `Quantity for product ${item.productId} must be a positive integer greater than zero`,
          });
        }

        const product = await Product.findByPk(item.productId);
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

      // Stripe amounts are in the smallest currency unit (cents for USD)
      const amountInCents = Math.round(total * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          products: JSON.stringify(
            validatedItems.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
            }))
          ),
          userId: req.user?.id?.toString() ?? "",
        },
      });

      return res.status(201).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
        currency,
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        return res.status(error.statusCode ?? 500).json({ error: error.message });
      }
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

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (
        paymentIntent.status !== "succeeded" &&
        paymentIntent.status !== "requires_capture"
      ) {
        return res.status(400).json({
          error: `Payment has not been completed. Current status: ${paymentIntent.status}`,
        });
      }

      // Prevent double-processing
      const existingPayment = await Payment.findOne({
        where: { transactionReference: paymentIntentId },
      });
      if (existingPayment) {
        return res.status(400).json({ error: "Payment has already been processed" });
      }

      const rawProducts = paymentIntent.metadata?.products;
      if (!rawProducts) {
        return res.status(400).json({ error: "Payment intent has no associated products" });
      }

      const cartItems: CartItem[] = JSON.parse(rawProducts);
      const authUserId = req.user?.id;

      // Wrap order creation, stock decrement, and payment record in a transaction
      const result = await db.transaction(async (t) => {
        let total = 0;
        const lockedProducts = new Map<number, Product>();

        // Lock product rows and validate stock within the transaction
        for (const item of cartItems) {
          const product = await Product.findOne({
            where: { id: item.productId },
            lock: t.LOCK.UPDATE,
            transaction: t,
          });
          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }
          if (product.stock < item.quantity) {
            throw new Error(
              `Product "${product.name}" no longer has enough stock. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }
          total += (product.price as number) * item.quantity;
          lockedProducts.set(item.productId, product);
        }

        const order = await Order.create(
          {
            userId: authUserId,
            shippingAddress,
            total,
            status: "paid",
          },
          { transaction: t }
        );

        for (const item of cartItems) {
          const product = lockedProducts.get(item.productId)!;
          await OrderProduct.create(
            {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            },
            { transaction: t }
          );

          // Atomically decrement stock only if sufficient quantity remains
          const [updatedCount] = await Product.update(
            { stock: literal(`stock - ${item.quantity}`) },
            {
              where: {
                id: item.productId,
                stock: { [Op.gte]: item.quantity },
              },
              transaction: t,
            }
          );
          if (updatedCount === 0) {
            throw new Error(
              `Failed to decrement stock for product with id ${item.productId}: insufficient stock`
            );
          }
        }

        const payment = await Payment.create(
          {
            orderId: order.id,
            method: "card",
            status: "approved",
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            transactionReference: paymentIntent.id,
          },
          { transaction: t }
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
        return res.status(error.statusCode ?? 500).json({ error: error.message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Error confirming payment" });
    }
  }
}

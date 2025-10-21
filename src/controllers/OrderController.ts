import { Request, Response } from "express";
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import Users from "../models/Users";
import Product from "../models/Product";
import Payment from "../models/Payment";

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const authUserId = req.user?.id;
      const { products, shippingAddress } = req.body; // products is an array of { productId, quantity, price }

      if (
        !authUserId ||
        !Array.isArray(products) ||
        products.length === 0 ||
        !shippingAddress
      ) {
        const errorMessage = new Error(
          "Missing Fields, please fill in all required information"
        );
        return res.status(400).json({ error: errorMessage.message });
      }
      //validate stock and calculate total using DB data
      let total = 0; // Calculate total price
      const priceCache = new Map<number, number>(); // Cache to store product prices

      for (const item of products) {
        const product = await Product.findByPk(item.id);
        if (!product || product.stock < item.quantity || product.stock <= 0) {
          const errorMessage = new Error(
            `Product with id ${item.id} is out of stock or you requested more than available`
          );
          return res.status(400).json({ error: errorMessage.message });
        }
        const unitPrice = product.price as number;
        priceCache.set(Number(product.id), unitPrice);
        total += unitPrice * item.quantity;
      }

      // Create the order
      const order = new Order({
        userId: authUserId,
        shippingAddress,
        total,
        status: "pending",
      });

      await order.save();

      // Associate products with the order
      for (const item of products) {
        const unitPrice = priceCache.get(Number(item.id));
        await OrderProduct.create({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: unitPrice,
        });

        const product = await Product.findByPk(item.id);

        // Decrease stock
        if (product) {
          product.stock = product.stock - item.quantity;
          await product.save();
        }
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Error creating order" });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await Order.findAll({});
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: "Error fetching orders" });
    }
  }

  static async getOrderById(req: Request, res: Response) {
    try {
      const order = await Order.findByPk(req.params.orderId, {
        include: [
          {
            model: Users,
            attributes: ["id", "userName", "email"],
          },
        ],
      });
      if (!order) {
        const errorMessage = new Error(
          `Order with id ${req.params.orderId} not found`
        );
        return res.status(404).json({ error: errorMessage.message });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: "Error fetching order by ID" });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    await req.order.save();
    res.status(200).json("Order status updated successfully");
  }

  static async deleteOrder(req: Request, res: Response) {
    await req.order.destroy();
    res.status(200).json("Order deleted successfully");
  }

  static async payOrder(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.orderId);
      const {
        method = "test",
        currency = "usd",
        notes,
        last4,
        brand,
      }: {
        method?: "test" | "card" | "cash" | "bank_transfer";
        currency?: string;
        notes?: string;
        last4?: string;
        brand?: string;
      } = req.body || {};

      if (!orderId) {
        const errorMessage = new Error("Order ID is required");
        return res.status(400).json({ error: errorMessage.message });
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        const errorMessage = new Error(`Order with id ${orderId} not found`);
        return res.status(404).json({ error: errorMessage.message });
      }

      if (order.status === "paid") {
        const errorMessage = new Error("Order is already paid");
        return res.status(400).json({ error: errorMessage.message });
      }

      // Here you would integrate with a real payment gateway
      const items = await OrderProduct.findAll({ where: { orderId } });
      const amount =
        items.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
        (order.total as number);

      //create payment record
      const payment = await Payment.create({
        orderId,
        method,
        status: "approved",
        amount,
        currency,
        notes,
        last4,
        brand,
      });

      order.set("status", "paid");
      await order.save();

      return res.status(200).json({
        orderId: order.id,
        paymentId: payment.id,
        status: "paid",
      });
    } catch (error) {
      const errorMessage = new Error("Error processing payment");
      return res.status(500).json({ error: errorMessage.message });
    }
  }
}

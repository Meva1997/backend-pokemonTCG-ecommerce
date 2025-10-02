import { Request, Response } from "express";
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import Users from "../models/Users";

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { userId, products, shippingAddress } = req.body; // products is an array of { productId, quantity, price }
      let total = 0; // Calculate total price
      products.forEach((product: { price: number; quantity: number }) => {
        total += product.price * product.quantity; // total price = sum of (price * quantity) for each product
      });

      // Create the order
      const order = new Order({
        userId,
        shippingAddress,
        total,
        status: "pending",
      });

      await order.save();

      // Associate products with the order
      for (const product of products) {
        await OrderProduct.create({
          orderId: order.id,
          productId: product.id,
          quantity: product.quantity,
          price: product.price,
        });
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error creating order" });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await Order.findAll({});
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
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
      res.status(500).json({ message: "Error fetching order by ID" });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    await req.order.save();
    res.status(200).json({ message: "Order status updated successfully" });
  }

  static async deleteOrder(req: Request, res: Response) {
    await req.order.destroy();
    res.status(200).json({ message: "Order deleted successfully" });
  }
}

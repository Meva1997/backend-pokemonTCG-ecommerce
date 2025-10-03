import { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import Order from "../models/Order";

declare global {
  namespace Express {
    interface Request {
      order?: Order;
    }
  }
}

export const validateOrderId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("orderId")
    .isInt()
    .withMessage("Invalid order ID")
    .custom((value) => value > 0)
    .withMessage("Invalid order ID")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateUpdatedOrderExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) {
      const errorMessage = new Error(`Order with id ${orderId} not found`);
      return res.status(404).json({ error: errorMessage.message });
    }
    if (status && order.status === status) {
      return res
        .status(400)
        .json({ error: "The order already has the specified status" });
    } else {
      order.status = status;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error updating order status" });
  }
};

export async function validateOrderExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      const errorMessage = new Error(
        `Order with id ${req.params.orderId} not found`
      );
      return res.status(404).json({ error: errorMessage.message });
    }
    req.order = order;
    next();
  } catch (error) {
    res.status(500).json({ error: "Error deleting order" });
  }
}

export async function hasAccessToOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const order = req.order;
    if (!user.isAdmin && order.userId !== user.id) {
      const errorMessage = new Error("Access denied");
      return res.status(403).json({ error: errorMessage.message });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Error checking order access" });
  }
}

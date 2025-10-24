import { Router } from "express";
import { handleInputErrors } from "../middleware/validation";
import { OrderController } from "../controllers/OrderController";
import { body } from "express-validator";
import {
  hasAccessToOrder,
  validateOrderExists,
  validateOrderId,
  validateUpdatedOrderExists,
} from "../middleware/order";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.param("orderId", validateOrderId);

router.get("/", handleInputErrors, authenticate, OrderController.getAllOrders);

router.post("/", handleInputErrors, authenticate, OrderController.createOrder);

router.get(
  "/:orderId",
  authenticate,
  validateOrderExists,
  hasAccessToOrder,
  OrderController.getOrderById
);

router.post(
  "/:orderId/pay",
  authenticate,
  validateOrderExists,
  hasAccessToOrder,
  handleInputErrors,
  OrderController.payOrder
);

router.put(
  "/:orderId",
  authenticate,
  requireAdmin,
  validateUpdatedOrderExists,
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "paid", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status value"),
  handleInputErrors,
  OrderController.updateOrderStatus
);

router.delete(
  "/:orderId",
  authenticate,
  requireAdmin,
  validateOrderExists,
  OrderController.deleteOrder
);

export default router;

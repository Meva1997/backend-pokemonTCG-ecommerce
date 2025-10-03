import { Router } from "express";
import { handleInputErrors } from "../middleware/validation";
import { OrderController } from "../controllers/OrderController";
import { body, param } from "express-validator";
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

router.post("/", handleInputErrors, OrderController.createOrder);

router.get(
  "/:orderId",
  authenticate,
  hasAccessToOrder,
  OrderController.getOrderById
);

router.put(
  "/:orderId",
  authenticate,
  requireAdmin,
  validateUpdatedOrderExists,
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "shipped", "delivered", "canceled"])
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

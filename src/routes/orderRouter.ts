import { Router } from "express";
import { handleInputErrors } from "../middleware/validation";
import { OrderController } from "../controllers/OrderController";
import { body, param } from "express-validator";
import {
  validateOrderExists,
  validateOrderId,
  validateUpdatedOrderExists,
} from "../middleware/order";

const router = Router();

router.param("orderId", validateOrderId);

router.get("/", handleInputErrors, OrderController.getAllOrders);

router.post("/", handleInputErrors, OrderController.createOrder);

router.get("/:orderId", OrderController.getOrderById);

router.put(
  "/:orderId",
  validateUpdatedOrderExists,
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "shipped", "delivered", "canceled"])
    .withMessage("Invalid status value"),
  handleInputErrors,
  OrderController.updateOrderStatus
);

router.delete("/:orderId", validateOrderExists, OrderController.deleteOrder);

export default router;

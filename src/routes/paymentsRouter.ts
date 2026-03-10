import { Router } from "express";
import { body } from "express-validator";
import { PaymentsController } from "../controllers/PaymentsController";
import { authenticate } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";

const router = Router();

router.post(
  "/create-intent",
  limiter,
  authenticate,
  body("products")
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array"),
  body("products.*.productId")
    .isInt({ gt: 0 })
    .withMessage("Each product must have a valid productId"),
  body("products.*.quantity")
    .isInt({ gt: 0 })
    .withMessage("Each product quantity must be a positive integer"),
  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter ISO code (e.g. usd, mxn)"),
  body("shipping")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Shipping must be a non-negative number"),
  body("tax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax must be a non-negative number"),
  handleInputErrors,
  PaymentsController.createPaymentIntent,
);

router.post(
  "/confirm",
  limiter,
  authenticate,
  body("paymentIntentId")
    .notEmpty()
    .isString()
    .withMessage("paymentIntentId is required"),
  body("shippingAddress")
    .notEmpty()
    .isString()
    .withMessage("shippingAddress is required"),
  handleInputErrors,
  PaymentsController.confirmPayment,
);

export default router;

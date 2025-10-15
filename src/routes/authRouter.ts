import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(limiter); // Apply rate limiting to all auth routes

// Ruta para crear cuenta
router.post(
  "/create-account",
  body("userName").notEmpty().withMessage("Username is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/login",
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .notEmpty()
    .withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/forgot-password",
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .notEmpty()
    .withMessage("Email is required"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.get("/user", authenticate, AuthController.authUser);

router.post(
  "/update-password",
  authenticate,
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("New password and confirmation do not match"),
  handleInputErrors,
  AuthController.updatePassword
);
router.post(
  "/check-password",
  authenticate,
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  handleInputErrors,
  AuthController.checkPassword
);

router.post(
  "/update-account",
  authenticate,
  body("userName")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  handleInputErrors,
  AuthController.updateAccount
);

//passsssssss

export default router;

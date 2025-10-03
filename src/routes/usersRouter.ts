import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import {
  validateUserBody,
  validateUserExists,
  validateUserId,
} from "../middleware/user";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate); // All routes below require authentication
router.use(requireAdmin); // All routes below require admin access

router.param("userId", validateUserId); // In every route with :userId apply this middleware
router.param("userId", validateUserExists); // In every route with :userId apply this middleware

router.get("/", UsersController.getAllUsers);

router.post("/", validateUserBody, UsersController.createUser);

router.get("/:userId", UsersController.getUserById);

router.put("/:userId", validateUserBody, UsersController.updateUserById);

router.delete("/:userId", UsersController.deleteUserById);

export default router;

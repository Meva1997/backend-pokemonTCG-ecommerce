import { Router } from "express";
import { handleInputErrors } from "../middleware/validation";
import { CategoryController } from "../controllers/CategoryController";
import {
  validateCategoryBody,
  validateCategoryExists,
  validateCategoryId,
} from "../middleware/category";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.param("categoryId", validateCategoryId); // In every route with :categoryId apply this middleware
router.param("categoryId", validateCategoryExists); // In every route with :categoryId apply this middleware

router.get("/", handleInputErrors, CategoryController.getAllCategories);

router.post(
  "/",
  validateCategoryBody,
  authenticate,
  requireAdmin,
  CategoryController.createCategory
);

router.get(
  "/:categoryId",
  handleInputErrors,
  CategoryController.getCategoryById
);

router.put(
  "/:categoryId",
  authenticate,
  requireAdmin,
  validateCategoryBody,
  CategoryController.updateCategoryById
);

router.delete(
  "/:categoryId",
  authenticate,
  requireAdmin,
  handleInputErrors,
  CategoryController.deleteCategoryById
);

export default router;

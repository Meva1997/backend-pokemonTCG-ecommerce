import { Router } from "express";
import { handleInputErrors } from "../middleware/validation";
import { CategoryController } from "../controllers/CategoryController";
import { body, param } from "express-validator";
import {
  validateCategoryBody,
  validateCategoryExists,
  validateCategoryId,
} from "../middleware/category";

const router = Router();

router.param("categoryId", validateCategoryId); // In every route with :categoryId apply this middleware
router.param("categoryId", validateCategoryExists); // In every route with :categoryId apply this middleware

router.get("/", handleInputErrors, CategoryController.getAllCategories);

router.post("/", validateCategoryBody, CategoryController.createCategory);

router.get(
  "/:categoryId",
  handleInputErrors,
  CategoryController.getCategoryById
);

router.put(
  "/:categoryId",
  validateCategoryBody,
  CategoryController.updateCategoryById
);

router.delete(
  "/:categoryId",
  handleInputErrors,
  CategoryController.deleteCategoryById
);

export default router;

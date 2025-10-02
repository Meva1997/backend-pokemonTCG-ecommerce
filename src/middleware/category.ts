import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Category from "../models/Category";

// Extend Request interface to include category property
declare global {
  namespace Express {
    interface Request {
      category?: Category;
    }
  }
}

export const validateCategoryBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .run(req);
  await body("description")
    .notEmpty()
    .withMessage("Description is required")
    .run(req);
  await body("icon").notEmpty().withMessage("Icon is required").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateCategoryId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  param("categoryId")
    .isInt()
    .withMessage("Invalid category ID")
    .custom((value) => value > 0)
    .withMessage("Invalid category ID")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateCategoryExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findByPk(req.params.categoryId);
    if (!category) {
      const errorMessage = new Error(
        `Category with id ${req.params.categoryId} not found`
      );
      return res.status(404).json({ error: errorMessage.message });
    }
    req.category = category;
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

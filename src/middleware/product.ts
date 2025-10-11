import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import Product from "../models/Product";

declare global {
  namespace Express {
    interface Request {
      product?: Product;
    }
  }
}

export const validateProductBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name")
    .isString()
    .notEmpty()
    .withMessage("Product name is required")
    .withMessage("Product name must be less than 255 characters")
    .run(req);

  await body("price")
    .notEmpty()
    .withMessage("Price is required")
    .custom((value) => {
      if (isNaN(value) || value <= 0) {
        throw new Error("Price must be a number greater than 0");
      }
      return true;
    })
    .run(req);

  await body("description")
    .isString()
    .notEmpty()
    .withMessage("Product description is required")
    .withMessage("Product description must be less than 500 characters")
    .run(req);

  await body("image")
    .notEmpty()
    .withMessage("Product image is required")
    .withMessage("Image URL must be less than 1000 characters")
    .isURL()
    .withMessage("Image must be a valid URL")
    .run(req);

  await body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a number greater than or equal to 0")
    .run(req);

  await body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isInt({ gt: 0 })
    .withMessage("Invalid Category ID")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateProductId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("productId")
    .isInt()
    .withMessage("Invalid Product ID")
    .custom((value) => value > 0)
    .withMessage("Invalid Product ID")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateProductExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      const errorMessage = new Error(
        `Product with id ${req.params.productId} not found`
      );
      return res.status(404).json({ error: errorMessage.message });
    }
    req.product = product;
    next();
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

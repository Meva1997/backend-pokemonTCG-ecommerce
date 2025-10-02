import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Users from "../models/Users";

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: Users;
    }
  }
}

export const validateUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("id")
    .isInt()
    .withMessage("Invalid user ID")
    .custom((value) => value > 0)
    .withMessage("Invalid user ID")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateUserBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("userName")
    .isString()
    .notEmpty()
    .withMessage("Username is required")
    .run(req);
  await body("email").isEmail().withMessage("Invalid email address").run(req);
  await body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await Users.findByPk(req.params.id);
    if (!user) {
      const errorMessage = new Error(`User with id ${req.params.id} not found`);
      return res.status(404).json({ error: errorMessage.message });
    }
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    res.status(500).json({ error: "Error finding user by id" });
  }
};

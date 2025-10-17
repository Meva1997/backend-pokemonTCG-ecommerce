import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Users from "../models/Users";
import { comparePassword, hashPassword } from "../utils/auth";

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: Users;
      updateResult?: {
        message: string;
        updated: boolean;
      };
    }
  }
}

export const validateUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("userId")
    .isInt()
    .withMessage("Invalid user ID")
    .custom((value) => value > 0)
    .withMessage("Invalid user ID")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array(), error: "Invalid user ID" });
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

export const validateUserUpdateBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("userName")
    .notEmpty()
    .withMessage("Username cannot be empty")
    .isString()
    .run(req);
  await body("email").isEmail().withMessage("Invalid email address").run(req);
  await body("currentPassword")
    .optional()
    .isString()
    .withMessage("Current password must be a string")
    .run(req);
  await body("newPassword")
    .optional()
    .isString()
    .withMessage("New password must be a string")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .run(req);
  await body("confirmNewPassword")
    .if(body("newPassword").exists()) // ✅ Solo valida si newPassword existe
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (req.body.newPassword && value !== req.body.newPassword) {
        throw new Error("New password and confirmation do not match");
      }
      return true;
    })
    .run(req);
  await body("isAdmin")
    .isBoolean()
    .notEmpty()
    .withMessage("Role is required")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateUserUpdateFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName, email, currentPassword, newPassword, isAdmin } = req.body;

    //? Validate that at least one field is provided for update
    if (newPassword && newPassword !== "") {
      const isValidPassword = await comparePassword(
        currentPassword,
        req.user.password
      );

      //? If currentPassword is provided, it must be valid
      if (!isValidPassword) {
        const errorMessage = new Error("Invalid password");
        return res.status(401).json({ error: errorMessage.message });
      }

      const newHashedPassword = await hashPassword(newPassword);

      req.user.password = newHashedPassword;
      await req.user.update({ password: newHashedPassword }); // Save only the password change

      req.updateResult = {
        message: "Password updated successfully",
        updated: true,
      };
      return next();
    }

    //? If no password change, check other fields
    if (typeof isAdmin === "boolean" && isAdmin !== req.user.isAdmin) {
      req.user.isAdmin = isAdmin;
      await req.user.update({ isAdmin }); // Save only the isAdmin change
      req.updateResult = {
        message: "User role updated successfully",
        updated: true,
      };
      return next();
    }

    //? If no changes detected, return an error
    if (
      email === req.user.email &&
      userName === req.user.userName &&
      isAdmin === req.user.isAdmin &&
      (!newPassword || newPassword === "")
    ) {
      const errorMessage = new Error("No changes detected");
      return res.status(400).json({ error: errorMessage.message });
    }

    req.user.userName = userName;
    req.user.email = email;
    await req.user.update({ userName, email });

    req.updateResult = { message: "User updated successfully", updated: true };

    next();
  } catch (error) {
    console.error("Error in processUserUpdate middleware:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

export const validateUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await Users.findByPk(req.params.userId);
    if (!user) {
      const errorMessage = new Error(
        `User with id ${req.params.userId} not found`
      );
      return res.status(404).json({ error: errorMessage.message });
    }
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    res.status(500).json({ error: "Error finding user by id" });
  }
};

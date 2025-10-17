import JWT from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Users from "../models/Users";
import { comparePassword, hashPassword } from "../utils/auth";

declare global {
  namespace Express {
    interface Request {
      user?: Users;
      accountUpdatedResult?: {
        message: string;
        updated: boolean;
      };
    }
  }
}

//! This middleware checks if the user is authenticated by verifying the JWT token in the Authorization header.

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) {
      const error = new Error("Unauthorized");
      return res.status(401).json({ error: error.message });
    }
    const token = bearer.split(" ")[1];
    if (!token) {
      const error = new Error("Unauthorized");
      return res.status(401).json({ error: error.message });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === "object" && decoded.id) {
      req.user = await Users.findByPk(decoded.id, {
        attributes: ["id", "userName", "email", "isAdmin"],
      });
      next();
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching user data" });
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      // Find if user is authenticated
      const error = new Error("Unauthorized");
      return res.status(401).json({ error: error.message });
    }

    if (!req.user.isAdmin) {
      const error = new Error("Admin access required");
      return res.status(403).json({ error: error.message });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Error checking admin status" });
  }
};

//* End of authentication and authorization middleware

//! section to validate AuthController

// ✅ New: Middleware that handles account update logic
export const processAccountUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      userName,
      email,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;

    // ✅ Obtener usuario completo con password para comparaciones
    const user = await Users.findByPk(req.user.id);
    if (!user) {
      const errorMessage = new Error("User not found");
      return res.status(404).json({ error: errorMessage.message });
    }

    // ✅ Verificar campos de contraseña
    const hasCurrentPassword = currentPassword && currentPassword.trim() !== "";
    const hasNewPassword = newPassword && newPassword.trim() !== "";
    const hasConfirmPassword =
      confirmNewPassword && confirmNewPassword.trim() !== "";

    // ✅ Validaciones de contraseña
    if ((hasNewPassword || hasConfirmPassword) && !hasCurrentPassword) {
      const errorMessage = new Error(
        "Current password is required when setting new password"
      );
      return res.status(400).json({ error: errorMessage.message });
    }

    if (hasCurrentPassword && (!hasNewPassword || !hasConfirmPassword)) {
      const errorMessage = new Error(
        "New password and confirmation are required when current password is provided"
      );
      return res.status(400).json({ error: errorMessage.message });
    }

    if (hasNewPassword && newPassword.length < 8) {
      const errorMessage = new Error(
        "New password must be at least 8 characters long"
      );
      return res.status(400).json({ error: errorMessage.message });
    }

    if (
      hasNewPassword &&
      hasConfirmPassword &&
      newPassword !== confirmNewPassword
    ) {
      const errorMessage = new Error(
        "New password and confirmation do not match"
      );
      return res.status(409).json({ error: errorMessage.message });
    }

    // ✅ Verificar si no hay cambios
    if (
      user.email === email &&
      user.userName === userName &&
      !hasCurrentPassword &&
      !hasNewPassword &&
      !hasConfirmPassword
    ) {
      return res.status(200).json("No changes detected");
    }

    // ✅ Manejar cambio de contraseña
    if (hasCurrentPassword && hasNewPassword && hasConfirmPassword) {
      const currentPasswordValid = await comparePassword(
        currentPassword,
        user.password
      );

      if (!currentPasswordValid) {
        const errorMessage = new Error("Current password is incorrect");
        return res.status(401).json({ error: errorMessage.message });
      }

      user.password = await hashPassword(newPassword);
    }

    // ✅ Actualizar datos básicos
    user.userName = userName;
    user.email = email;
    await user.save();

    // ✅ Almacenar resultado para el controlador
    const message = hasNewPassword
      ? "Account and password updated successfully"
      : "Account updated successfully";

    req.accountUpdatedResult = {
      message,
      updated: true,
    };

    next();
  } catch (error) {
    // console.error("Error in processAccountUpdate middleware:", error);
    res.status(500).json({ error: "Error updating account" });
  }
};

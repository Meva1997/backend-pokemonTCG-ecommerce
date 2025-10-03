import JWT from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Users from "../models/Users";

declare global {
  namespace Express {
    interface Request {
      user?: Users;
    }
  }
}

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

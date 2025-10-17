import type { Request, Response } from "express";
import Users from "../models/Users";
import { comparePassword, hashPassword } from "../utils/auth";

export class UsersController {
  // GET /api/users

  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await Users.findAll({
        attributes: {
          exclude: ["password", "createdAt", "updatedAt", "token"],
        },
        order: [["createdAt", "DESC"]],
        //? TODO: Include associated models if needed
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users" });
    }
  };

  static createUser = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        const errorMessage = new Error(`Email: ${email} is already in use`);
        return res.status(409).json({ error: errorMessage.message });
      }

      const users = new Users(req.body);
      users.password = await hashPassword(users.password);
      await users.save();
      res.status(201).json("User created successfully");
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  };

  static getUserById = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateUserById = async (req: Request, res: Response) => {
    try {
      if (req.updateResult) {
        res.status(200).json(req.updateResult.message);
      }
    } catch (error) {
      // console.error("Error updating user:", error);
      res.status(500).json({ error: "Error updating user" });
    }
  };

  static deleteUserById = async (req: Request, res: Response) => {
    await req.user.destroy();
    res.status(200).json("User deleted successfully");
  };
}

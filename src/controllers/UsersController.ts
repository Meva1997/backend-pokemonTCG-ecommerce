import type { Request, Response } from "express";
import Users from "../models/Users";

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
      const users = new Users(req.body);
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
    await req.user.update(req.body);
    res.status(200).json("User updated successfully");
  };

  static deleteUserById = async (req: Request, res: Response) => {
    await req.user.destroy();
    res.status(200).json("User deleted successfully");
  };
}

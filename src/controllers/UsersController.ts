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
    const { userName, email, currentPassword, newPassword, isAdmin } = req.body;
    // const user = await Users.findByPk(req.user.id);

    if (newPassword && newPassword !== "") {
      const isValidPassword = await comparePassword(
        currentPassword,
        req.user.password
      );

      if (!isValidPassword) {
        const errorMessage = new Error("Invalid password");
        return res.status(401).json({ error: errorMessage.message });
      }

      const newHashedPassword = await hashPassword(newPassword);

      req.user.password = newHashedPassword;
      await req.user.update({ password: newHashedPassword }); // Save only the password change
      return res.status(200).json("Password updated successfully");
    }

    if (typeof isAdmin === "boolean" && isAdmin !== req.user.isAdmin) {
      req.user.isAdmin = isAdmin;
      await req.user.update({ isAdmin }); // Save only the isAdmin change
      return res.status(200).json("User role updated successfully");
    }

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

    await req.user.update(req.body);
    res.status(200).json("User updated successfully");
  };

  static deleteUserById = async (req: Request, res: Response) => {
    await req.user.destroy();
    res.status(200).json("User deleted successfully");
  };
}

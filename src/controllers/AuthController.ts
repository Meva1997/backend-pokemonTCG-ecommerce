import { Request, Response } from "express";
import Users from "../models/Users";
import { generateJwt } from "../utils/jwt";
import { comparePassword, hashPassword } from "./../utils/auth";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Verificar si el email ya existe
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        const errorMessage = new Error(`Email: ${email} is already in use`);
        return res.status(409).json({ error: errorMessage.message });
      }

      const user = new Users(req.body);
      // Hashear la contraseña antes de guardar
      user.password = await hashPassword(user.password);
      await user.save();
      res.json("Account created successfully");
    } catch (error) {
      res.status(500).json({ error: "Error creating account" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        const errorMessage = new Error("User not found");
        return res.status(404).json({ error: errorMessage.message });
      }
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        const errorMessage = new Error("Invalid password");
        return res.status(401).json({ error: errorMessage.message });
      }

      const token = generateJwt(user.id);

      // Retornar información del usuario sin la contraseña
      // const userInfo = {
      //   id: user.id,
      //   userName: user.userName,
      //   email: user.email,
      //   isAdmin: user.isAdmin,
      //   confirmed: user.confirmed,
      // };

      // res.status(200).json({
      //   message: "Login successful",
      //   token,
      //   user: userInfo,
      // });
      res.status(200).json(token);
    } catch (error) {
      res.status(500).json({ error: "Error logging in" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const user = await Users.findOne({ where: { email: req.body.email } });
      if (!user) {
        const errorMessage = new Error("User not found");
        return res.status(404).json({ error: errorMessage.message });
      }
      // Logic to send password recovery email would go here
      res
        .status(200)
        .json({ message: "Password reset instructions sent to email" });
    } catch (error) {
      res.status(500).json({ error: "Error processing forgot password" });
    }
  };

  static authUser = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updatePassword = async (req: Request, res: Response) => {
    try {
      const { id } = req.user;
      const user = await Users.findByPk(id);

      const currentPasswordValid = await comparePassword(
        req.body.currentPassword,
        user.password
      );
      if (!currentPasswordValid) {
        const errorMessage = new Error("Current password is incorrect");
        return res.status(401).json({ error: errorMessage.message });
      }

      const passwords = req.body;
      if (passwords.newPassword !== passwords.confirmNewPassword) {
        const errorMessage = new Error(
          "New password and confirmation do not match"
        );
        return res.status(409).json({ error: errorMessage.message });
      }

      user.password = await hashPassword(passwords.newPassword);
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error updating password" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    try {
      const { currentPassword } = req.body;
      const user = await Users.findByPk(req.user.id);
      const isPasswordValid = await comparePassword(
        currentPassword,
        user.password //this one is saved in the db
      );
      if (!isPasswordValid) {
        const errorMessage = new Error("Current password is incorrect");
        return res.status(401).json({ error: errorMessage.message });
      }
      res.status(200).json("Current password is correct");
    } catch (error) {
      res.status(500).json({ error: "Error checking password" });
    }
  };

  static updateAccount = async (req: Request, res: Response) => {
    try {
      const {
        userName,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
      } = req.body;
      const user = await Users.findByPk(req.user.id);
      if (!user) {
        const errorMessage = new Error("User not found");
        return res.status(404).json({ error: errorMessage.message });
      }

      // ✅ NUEVA VALIDACIÓN: Verificar campos de contraseña
      const hasCurrentPassword =
        currentPassword && currentPassword.trim() !== "";
      const hasNewPassword = newPassword && newPassword.trim() !== "";
      const hasConfirmPassword =
        confirmNewPassword && confirmNewPassword.trim() !== "";

      // ✅ Si hay newPassword o confirmNewPassword, currentPassword es obligatorio
      if ((hasNewPassword || hasConfirmPassword) && !hasCurrentPassword) {
        const errorMessage = new Error(
          "Current password is required when setting new password"
        );
        return res.status(400).json({ error: errorMessage.message });
      }

      // ✅ Si hay currentPassword, newPassword y confirmNewPassword son obligatorios
      if (hasCurrentPassword && (!hasNewPassword || !hasConfirmPassword)) {
        const errorMessage = new Error(
          "New password and confirmation are required when current password is provided"
        );
        return res.status(400).json({ error: errorMessage.message });
      }

      // ✅ Validar longitud de nueva contraseña
      if (hasNewPassword && newPassword.length < 8) {
        const errorMessage = new Error(
          "New password must be at least 8 characters long"
        );
        return res.status(400).json({ error: errorMessage.message });
      }

      // ✅ Validar que las contraseñas coincidan
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

      // ✅ Verificar si no hay cambios (datos básicos y sin contraseñas)
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

      // ✅ Mensaje apropiado según lo que se actualizó
      const message = hasNewPassword
        ? "Account and password updated successfully"
        : "Account updated successfully";

      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ error: "Error updating account" });
    }
  };
}

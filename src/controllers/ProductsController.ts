import { ErrorMessage } from "./../../node_modules/express-validator/lib/base.d";
import Product from "../models/Product";
import { Request, Response } from "express";
import { comparePassword } from "../utils/auth";
import Users from "../models/Users";

export class ProductsController {
  static getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await Product.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Error fetching products" });
    }
  };

  static createProduct = async (req: Request, res: Response) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json("Product created successfully");
    } catch (error) {
      res.status(500).json({
        error: "Error creating product",
      });
    }
  };

  static getProductById = async (req: Request, res: Response) => {
    res.json(req.product);
  };

  static updateProduct = async (req: Request, res: Response) => {
    await req.product.update(req.body);
    res.status(200).json("Product updated successfully");
  };

  static deleteProductById = async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (!password) {
        const errorMessage = new Error(
          "Password is required to delete a product"
        );
        return res.status(400).json({ error: errorMessage.message });
      }

      const userPassword = await Users.findByPk(req.user.id, {
        attributes: ["password"],
      });

      if (!userPassword) {
        return res.status(500).json({ error: "User password not found" });
      }

      const isPasswordValid = await comparePassword(
        password,
        userPassword.password
      );

      if (!isPasswordValid) {
        const errorMessage = new Error("Incorrect password");
        return res.status(401).json({ error: errorMessage.message });
      }

      await req.product.destroy();
      res.status(200).json("Product deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      res.status(500).json({
        error: "Error deleting product",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

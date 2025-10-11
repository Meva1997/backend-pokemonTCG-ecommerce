import { ErrorMessage } from "./../../node_modules/express-validator/lib/base.d";
import Product from "../models/Product";
import { Request, Response } from "express";

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
      res
        .status(500)
        .json({
          error: "Error creating product",
          details: (error as Error).message,
        });
    }
  };

  static getProductById = async (req: Request, res: Response) => {
    res.json(req.product);
  };

  static updateProduct = async (req: Request, res: Response) => {
    await req.product.update(req.body);
    res.status(200).json({ message: "Product updated successfully" });
  };

  static deleteProductById = async (req: Request, res: Response) => {
    await req.product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  };
}

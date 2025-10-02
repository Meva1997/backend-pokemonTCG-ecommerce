import { Request, Response } from "express";
import Category from "../models/Category";

export class CategoryController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.findAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const category = new Category(req.body);
      await category.save();
      res.status(201).json("Category created successfully");
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    res.status(200).json(req.category);
  }

  static async updateCategoryById(req: Request, res: Response) {
    await req.category.update(req.body);
    res.status(200).json("Category updated successfully");
  }

  static async deleteCategoryById(req: Request, res: Response) {
    await req.category.destroy();
    res.status(200).json("Category deleted successfully");
  }
}

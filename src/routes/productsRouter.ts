import { Router } from "express";
import { ProductsController } from "../controllers/ProductsController";
import { handleInputErrors } from "../middleware/validation";
import { body, param } from "express-validator";
import {
  validateProductBody,
  validateProductExists,
  validateProductId,
} from "../middleware/product";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.param("productId", validateProductId);
router.param("productId", validateProductExists);

router.get("/", ProductsController.getAllProducts);

router.post(
  "/",
  authenticate,
  requireAdmin,
  validateProductBody,
  ProductsController.createProduct
);

router.get("/:productId", ProductsController.getProductById);

router.put(
  "/:productId",
  authenticate,
  requireAdmin,
  validateProductBody,
  ProductsController.updateProduct
);

router.delete(
  "/:productId",
  authenticate,
  requireAdmin,
  ProductsController.deleteProductById
);

export default router;

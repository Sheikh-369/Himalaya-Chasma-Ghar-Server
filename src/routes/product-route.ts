import express, { Router } from "express";
import asyncErrorHandler from "../services/async-error-handler";
import * as ProductController from "../controllers/product-controller";
import upload from "../middleware/multer-upload";

const router: Router = express.Router();

// Create a product
router.route("/product").post(
  upload.single("image"),
  asyncErrorHandler(ProductController.createProduct)
);

// Get all products
router.route("/product").get(
    asyncErrorHandler(ProductController.getAllProducts)
);

// Get product by ID
router.route("/product/:id").get(
    asyncErrorHandler(ProductController.getProductById)
);

// Update product
router.route("/product/:id").patch(
  upload.single("image"),
  asyncErrorHandler(ProductController.updateProduct)
);

// Delete product
router.route("/product/:id").delete(
    asyncErrorHandler(ProductController.deleteProduct)
);

// Get products by category
router.route("/product/:category").get(
  asyncErrorHandler(ProductController.getProductsByCategory)
);

// Get featured products
router.route("/product/featured").get(
    asyncErrorHandler(ProductController.getFeaturedProducts)
);

export default router;
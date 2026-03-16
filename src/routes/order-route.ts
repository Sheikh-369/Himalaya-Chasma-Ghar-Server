import express, { Router } from "express";
import asyncErrorHandler from "../services/async-error-handler";
import * as OrderController from "../controllers/order-controller";

const router: Router = express.Router();

// Create a new order
router.route("/order").post(
  asyncErrorHandler(OrderController.createOrder)
);

// Admin: Update order status
router.route("/order-status/:id").patch(
  asyncErrorHandler(OrderController.updateOrderStatus)
);

// Customer: Cancel order
router.route("/order-cancel/:id").patch(
  asyncErrorHandler(OrderController.cancelOrder)
);

export default router;
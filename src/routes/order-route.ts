import express, { Router } from "express";
import asyncErrorHandler from "../services/async-error-handler";
import * as OrderController from "../controllers/order-controller";
import upload from "../middleware/multer-upload";
import Middleware, { Role } from "../middleware/middleware";

const router: Router = express.Router();

// Create a new order
router.route("/order").post(
  upload.single("paymentProof"),
  asyncErrorHandler(OrderController.createOrder)
);

//fetch all orders
router.route("/order").get(
  Middleware.isLoggedIn,
  Middleware.accessTo(Role.Admin),
  asyncErrorHandler(OrderController.getAllOrders)
)

//fetch single order
router.route("/order/:id").get(
  asyncErrorHandler(OrderController.getOrderById)
)

// Admin: Update order status
router.route("/order-status/:id").patch(
  Middleware.isLoggedIn,
  Middleware.accessTo(Role.Admin),
  asyncErrorHandler(OrderController.updateOrderStatus)
);

// Customer: Cancel order
router.route("/order-cancel/:id").patch(
  asyncErrorHandler(OrderController.cancelOrder)
);

//delete order-admin
router.route("/delete-order/:id").delete(
  Middleware.isLoggedIn,
  Middleware.accessTo(Role.Admin),
  asyncErrorHandler(OrderController.deleteOrder)
)

export default router;
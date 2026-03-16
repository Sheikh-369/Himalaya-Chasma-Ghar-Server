import { Request, Response } from "express";
import Order from "../database/model/order-modal";
import Product from "../database/model/product-model";
import sequelize from "../database/connection";
import OrderItem from "../database/model/order-item-model";

/**
 * Create Order
 */
export const createOrder = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      firstName,
      lastName,
      whatsappNumber,
      email,
      deliveryAddress,
      paymentMethod,
      items,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !whatsappNumber ||
      !deliveryAddress ||
      !paymentMethod ||
      !items ||
      items.length === 0
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Required order fields are missing!",
      });
    }

    let totalAmount = 0;

    const order = await Order.create(
      {
        firstName,
        lastName,
        whatsappNumber,
        email: email || null,
        deliveryAddress,
        paymentMethod,
        totalAmount: 0,
      },
      { transaction }
    );

    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findOne({ where: { id: item.productId } });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Product not found with id ${item.productId}`,
        });
      }

      const quantity = item.quantity || 1;
      const price = product.price;

      totalAmount += price * quantity;

      orderItemsData.push({
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        price,
        quantity,
        image: product.image || null,
      });
    }

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    order.totalAmount = totalAmount;
    await order.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Order created successfully!",
      order,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Failed to create order",
      error,
    });
  }
};

/**
 * Update Order Status (Admin)
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["pending", "confirmed", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status!",
    });
  }

  const order = await Order.findOne({ where: { id } });

  if (!order) {
    return res.status(404).json({
      message: "Order not found!",
    });
  }

  // Optional rules
  if (order.orderStatus === "cancelled") {
    return res.status(400).json({
      message: "Cancelled order cannot be updated!",
    });
  }

  if (order.orderStatus === "delivered" && status !== "delivered") {
    return res.status(400).json({
      message: "Delivered order cannot be changed!",
    });
  }

  order.orderStatus = status;
  await order.save();

  res.status(200).json({
    message: "Order status updated successfully!",
    order,
  });
};

/**
 * Cancel Order (Customer)
 */
export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findOne({ where: { id } });

  if (!order) {
    return res.status(404).json({
      message: "Order not found!",
    });
  }

  if (order.orderStatus === "cancelled") {
    return res.status(400).json({
      message: "Order already cancelled!",
    });
  }

  if (order.orderStatus === "delivered") {
    return res.status(400).json({
      message: "Delivered order cannot be cancelled!",
    });
  }

  order.orderStatus = "cancelled";
  await order.save();

  res.status(200).json({
    message: "Order cancelled successfully!",
    order,
  });
};
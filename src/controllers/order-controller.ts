import { Request, Response } from "express";
import Order from "../database/model/order-modal";
import Product from "../database/model/product-model";
import sequelize from "../database/connection";
import OrderItem from "../database/model/order-item-model";
import sendEmail from "../services/emailService";

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


    // ✅ Parse items (important for FormData)
    let parsedItems;
    try {
      parsedItems =
        typeof items === "string" ? JSON.parse(items) : items;
    } catch (err) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Invalid items format",
      });
    }

    // ✅ Basic validation
    if (
      !firstName ||
      !lastName ||
      !whatsappNumber ||
      !deliveryAddress ||
      !paymentMethod ||
      !parsedItems ||
      parsedItems.length === 0
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Required order fields are missing!",
      });
    }


    // ✅ QR payment must include screenshot
    if (paymentMethod === "qr_scan" && !req.file) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Full payment screenshot is required",
      });
    }

    if (paymentMethod === "cod" && !req.file) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Delivery fee screenshot is required for COD",
      });
    }

    // ✅ Handle uploaded file
    const paymentProof = req.file ? req.file.path : null;

    let totalAmount = 0;

    // ✅ Create order first
    const order = await Order.create(
      {
        firstName,
        lastName,
        whatsappNumber,
        email: email || null,
        deliveryAddress,
        paymentMethod,
        totalAmount: 0, // will update later
        paymentProof, // ✅ saved here
      },
      { transaction }
    );

    const orderItemsData = [];

    // ✅ Loop through items
    for (const item of parsedItems) {
      const product = await Product.findByPk(item.productId);

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

    // ✅ Save order items
    await OrderItem.bulkCreate(orderItemsData, { transaction });

    // ✅ Update total amount
    order.totalAmount = totalAmount;
    await order.save({ transaction });

    // ✅ Commit transaction
    await transaction.commit();

    sendEmail({
      to: email,
      subject: "Your Order Confirmation - Himalaya Chasma Ghar",
      html: `<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #0ea5e9, #22c55e); padding: 20px; color: white; text-align: center;">
        <h2 style="margin: 0;">Himalaya Chasma Ghar</h2>
        <p style="margin: 5px 0 0;">Birtamode, Jhapa, Nepal</p>
      </div>

      <!-- Body -->
      <div style="padding: 20px; color: #333;">
        <h3 style="margin-top: 0;">🛍️ Order Confirmation</h3>

        <p>Hi <strong>${firstName} ${lastName}</strong>,</p>
        <p>Thank you for your order! Here are your order details:</p>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>📦 Order ID:</strong> ${order.id}</p>
          <p><strong>💰 Total:</strong> Rs. ${totalAmount}</p>
          <p><strong>💳 Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>📍 Delivery Address:</strong> ${deliveryAddress}</p>
        </div>

        <p style="margin-top: 20px;">
          ${
            paymentMethod === "visit_pay"
              ? "⏳ Please visit our store to complete your payment."
              : paymentMethod === "qr_scan"
              ? "✅ Your QR payment proof has been received. We'll verify it shortly."
              : "🚚 Your order will be delivered soon."
          }
        </p>

        <p style="margin-top: 20px;">We'll contact you soon via WhatsApp.</p>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">© Himalaya Chasma Ghar</p>
        <p style="margin: 0;">Birtamode, Jhapa, Nepal</p>
      </div>
    </div>
  </div>`,
    });

    return res.status(200).json({
      message: "Order placed successfully!",
      order,
    });

  } catch (error) {
    await transaction.rollback();

    console.error("Order creation error:", error);

    return res.status(500).json({
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

  // ✅ Prevent unnecessary update
  if (order.orderStatus === status) {
    return res.status(400).json({
      message: "Order already has this status!",
    });
  }

  // ✅ Business rules
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

  // ✅ Save old status (for email context)
  const previousStatus = order.orderStatus;

  // ✅ Update
  order.orderStatus = status;
  await order.save();

  // ✅ Send email ONLY if user has email
  if (order.email) {
    let subject = "";
    let message = "";

    switch (status) {
      case "confirmed":
        subject = "✅ Order Confirmed - Himalaya Chasma Ghar";
        message = `
          <p>Your order <strong>#${order.id}</strong> has been confirmed.</p>
          <p>We are now preparing your items.</p>
        `;
        break;

      case "delivered":
        subject = "🎉 Order Delivered - Himalaya Chasma Ghar";
        message = `
          <p>Your order <strong>#${order.id}</strong> has been delivered successfully.</p>
          <p>Thank you for shopping with us ❤️</p>
        `;
        break;

      case "cancelled":
        subject = "❌ Order Cancelled - Himalaya Chasma Ghar";
        message = `
          <p>Your order <strong>#${order.id}</strong> has been cancelled.</p>
          <p>If this was a mistake, please contact us.</p>
        `;
        break;

      case "pending":
        subject = "⏳ Order Pending - Himalaya Chasma Ghar";
        message = `
          <p>Your order <strong>#${order.id}</strong> is currently pending.</p>
        `;
        break;
    }

    // ✅ Reusable email template
    await sendEmail({
      to: order.email,
      subject,
      html: `
        <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
            
            <div style="background: linear-gradient(90deg,#0ea5e9,#22c55e); padding:20px; color:white; text-align:center;">
              <h2>Himalaya Chasma Ghar</h2>
              <p>Birtamode, Jhapa, Nepal</p>
            </div>

            <div style="padding:20px;">
              <h3>Order Update</h3>

              <p>Hi <strong>${order.firstName} ${order.lastName}</strong>,</p>

              <p>Your order status has been updated:</p>

              <p>
                <strong>Order ID:</strong> #${order.id}<br/>
                <strong>Previous Status:</strong> ${previousStatus}<br/>
                <strong>New Status:</strong> ${status}
              </p>

              <div style="margin-top:15px;">
                ${message}
              </div>

              <p style="margin-top:20px;">
                📞 We may contact you via WhatsApp if needed.
              </p>
            </div>

            <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px;">
              © Himalaya Chasma Ghar
            </div>

          </div>
        </div>
      `,
    });
  }

  return res.status(200).json({
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


/**
 * Get All Orders (Admin)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Orders fetched successfully!",
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
      error,
    });
  }
};

/**
 * Get Single Order
 */
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully!",
      order,
    });
  } catch (error) {
    console.error("Fetch single order error:", error);

    return res.status(500).json({
      message: "Failed to fetch order",
      error,
    });
  }
};

/**
 * Delete Order (Admin)
 */
export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  const transaction = await sequelize.transaction();

  // Find the order first
  const order = await Order.findOne({
    where: { id },
    include: [OrderItem],
    transaction,
  });

  if (!order) {
    await transaction.rollback();
    return res.status(404).json({
      message: "Order not found!",
    });
  }

  // Delete associated OrderItems first
  await OrderItem.destroy({ where: { orderId: id }, transaction });

  // Delete the order itself
  await Order.destroy({ where: { id }, transaction });

  await transaction.commit();

  return res.status(200).json({
    message: "Order deleted successfully!",
    id,
  });
};
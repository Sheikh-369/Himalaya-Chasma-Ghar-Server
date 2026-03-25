import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "orders",
  modelName: "Order",
  timestamps: true,
})
class Order extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare whatsappNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare email: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare deliveryAddress: string;

  @Column({
    type: DataType.ENUM("cod", "qr_scan", "visit_pay"),
    allowNull: false,
  })
  declare paymentMethod: "cod" | "qr_scan" | "visit_pay";

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare totalAmount: number;

  @Column({
    type: DataType.ENUM("pending", "confirmed", "delivered", "cancelled"),
    defaultValue: "pending",
  })
  declare orderStatus: "pending" | "confirmed" | "delivered" | "cancelled";

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare paymentProof: string | null;
  
}


export default Order;
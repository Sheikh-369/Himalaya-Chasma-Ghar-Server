import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import Order from "./order-modal";
import Product from "./product-model";

@Table({
  tableName: "orderItems",
  modelName: "OrderItem",
  timestamps: true,
})
class OrderItem extends Model {

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare orderId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare productName: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  declare quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image: string | null;
}

export default OrderItem;
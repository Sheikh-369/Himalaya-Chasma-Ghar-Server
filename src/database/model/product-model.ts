import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "products",
  modelName: "Product",
  timestamps: true,
})

class Product extends Model {

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
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare brand: string;

  @Column({
    type: DataType.ENUM("Sunglasses", "Prescription", "Designer"),
    allowNull: false,
  })
  declare category: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare originalPrice: number | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare badge: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare image: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare alt: string | null;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare rating: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare reviews: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare features: string[] | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare frameDetails: { label: string; value: string }[] | null;

}

export default Product;
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  modelName: 'User',
  timestamps: true,
})

class User extends Model {
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
  declare userName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare userEmail: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare whatsAppNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare userPassword: string;

  @Column({
    type: DataType.ENUM('customer', 'admin'),
    defaultValue: 'customer',
    allowNull: false,
  })
  declare role: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: "https://avatars.dicebear.com/api/identicon/default.svg",
  })
  declare profileImage: string | null; // URL of user's profile picture


  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare city: string | null;


  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare district: string | null;

//   @Column({
//     type: DataType.ENUM('pending', 'approved', 'rejected'),
//     defaultValue: 'pending',
//     allowNull: false,
//   })
//   declare paymentStatus: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare OTP: string | null;


  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare OTPGeneratedTime: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare OTPExpiry: Date | null;

}

export default User;
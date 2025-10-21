import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import Order from "./Order";

@Table({
  tableName: "payments",
})
class Payment extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
  })
  declare id: number;

  @ForeignKey(() => Order)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare orderId: number;

  @BelongsTo(() => Order)
  declare order: Order;

  @AllowNull(false)
  @Default("test")
  @Column({
    type: DataType.ENUM("test", "card", "cash", "bank_transfer"),
  })
  declare method: "test" | "card" | "cash" | "bank_transfer";

  @AllowNull(false)
  @Default("approved")
  @Column({
    type: DataType.ENUM(
      "pending",
      "approved",
      "rejected",
      "refunded",
      "canceled"
    ),
  })
  declare status: "pending" | "approved" | "rejected" | "refunded" | "canceled";

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT, // Nota: más adelante puedes migrar a DECIMAL(10,2)
  })
  declare amount: number;

  @AllowNull(false)
  @Default("usd")
  @Column({
    type: DataType.STRING(3),
  })
  declare currency: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare transactionReference?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare last4?: string; // opcional (nunca guardar PAN ni CVC)

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare brand?: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare notes?: string;
}

export default Payment;

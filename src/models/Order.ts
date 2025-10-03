import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Users from "./Users";
import Product from "./Product";
import OrderProduct from "./OrderProduct";

@Table({
  tableName: "orders",
})
class Order extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare userId: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @Default("pending")
  @AllowNull(false)
  @Column({
    type: DataType.ENUM("pending", "paid", "shipped", "cancelled"),
  })
  declare status: "pending" | "paid" | "shipped" | "cancelled";

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  declare shippingAddress: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  declare total: number;

  @BelongsToMany(() => Product, () => OrderProduct)
  declare products: Product[];
}

export default Order;

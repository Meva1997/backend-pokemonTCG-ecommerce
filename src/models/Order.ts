import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import Users from "./Users";
import Product from "./Product";
import OrderProduct from "./OrderProduct";
import Payment from "./Payment";

@Table({
  tableName: "orders",
})
class Order extends Model {
  //! Foreign key to Users table it is used to associate each order with a specific user.
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
    type: DataType.ENUM("pending", "paid", "shipped", "delivered", "cancelled"),
  })
  declare status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";

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

  @HasMany(() => OrderProduct)
  declare orderProducts: OrderProduct[];

  @HasOne(() => Payment)
  declare payment: Payment;

  // @BelongsToMany(() => Product, () => OrderProduct)
  // declare products: Product[];

  //?BelongsToMany is used to define a many-to-many relationship between two models. In this case, it indicates that an Order can have many Products, and a Product can belong to many Orders. The second argument, () => OrderProduct, specifies the through table (or junction table) that holds the associations between Orders and Products.
}

export default Order;

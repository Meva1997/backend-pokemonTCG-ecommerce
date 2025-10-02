import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
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
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @Column({
    type: DataType.ENUM("pending", "paid", "shipped", "cancelled"),
    defaultValue: "pending",
    allowNull: false,
  })
  declare status: "pending" | "paid" | "shipped" | "cancelled";

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare shippingAddress: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare total: number;

  @BelongsToMany(() => Product, () => OrderProduct)
  declare products: Product[];

  //BelongsToMany is used to define a many-to-many relationship between two models. In this case, it indicates that an Order can have many Products, and a Product can belong to many Orders. The second argument, () => OrderProduct, specifies the through table (or junction table) that holds the associations between Orders and Products.
}

export default Order;

import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Order from "./Order";
import Product from "./Product";

@Table({
  tableName: "order_products",
  timestamps: false,
})
class OrderProduct extends Model {
  @ForeignKey(() => Order)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare orderId: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare productId: number;

  @AllowNull(false)
  @Default(1)
  @Column({
    type: DataType.INTEGER,
  })
  declare quantity: number;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  declare price: number;
}

export default OrderProduct;

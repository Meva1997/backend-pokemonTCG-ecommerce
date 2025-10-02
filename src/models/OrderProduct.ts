import {
  Column,
  DataType,
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
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare orderId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  declare quantity: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;
}

export default OrderProduct;

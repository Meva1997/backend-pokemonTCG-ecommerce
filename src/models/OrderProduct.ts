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
import Product from "./Product";

@Table({
  tableName: "order_products",
  timestamps: false,
})
class OrderProduct extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
  })
  declare id: number; // <--- AGREGADO

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

  @BelongsTo(() => Product)
  declare product: Product;
}

export default OrderProduct;

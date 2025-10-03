import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Users from "./Users";
import Product from "./Product";

@Table({
  tableName: "cartItems",
  timestamps: false,
})
class CartItem extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  productId: number;

  @AllowNull(false)
  @Default(1)
  @Column({
    type: DataType.INTEGER,
  })
  quantity: number;

  //Relations
  // A cart item belongs to a user
  @BelongsTo(() => Users)
  user: Users;

  // A cart item belongs to a product
  @BelongsTo(() => Product)
  product: Product;
}

export default CartItem;

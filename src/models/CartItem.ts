import {
  BelongsTo,
  Column,
  DataType,
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
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
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

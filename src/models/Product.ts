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
import Category from "./Category";

@Table({
  tableName: "products",
})
class Product extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
  })
  declare description: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  declare price: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare image: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
  })
  declare stock: number;

  @ForeignKey(() => Category)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;
}

export default Product;

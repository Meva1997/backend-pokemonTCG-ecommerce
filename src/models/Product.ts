import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Category from "./Category";

@Table({
  tableName: "products",
})
class Product extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare stock: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;
}

export default Product;

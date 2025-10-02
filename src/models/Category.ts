import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Product from "./Product";

@Table({
  tableName: "categories",
})
class Category extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare icon: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare parentId: number | null;

  @HasMany(() => Product)
  declare products: Product[];
}

export default Category;

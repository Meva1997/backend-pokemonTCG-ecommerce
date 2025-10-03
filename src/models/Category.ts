import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import Product from "./Product";

@Table({
  tableName: "categories",
})
class Category extends Model {
  @AllowNull(false)
  @Unique(true)
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
    type: DataType.STRING,
  })
  declare icon: string;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare parentId: number | null;

  @HasMany(() => Product)
  declare products: Product[];
}

export default Category;

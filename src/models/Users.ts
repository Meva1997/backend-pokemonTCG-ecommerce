import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import Order from "./Order";

@Table({
  tableName: "users",
})
class Users extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare userName: string;

  @Unique(true)
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare email: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(20),
  })
  declare password: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare isAdmin: boolean;

  @Column({
    type: DataType.STRING(6),
  })
  declare token: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare confirmed: boolean;

  @HasMany(() => Order)
  declare orders: Order[];
}

export default Users;

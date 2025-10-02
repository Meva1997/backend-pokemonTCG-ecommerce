import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "users",
})
class Users extends Model {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare userName: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isAdmin: boolean;

  @Column({
    type: DataType.STRING(6),
  })
  declare token: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  declare confirmed: boolean;
}

export default Users;

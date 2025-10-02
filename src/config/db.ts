import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config(); //reads .env

export const db = new Sequelize(process.env.DATABASE_URL, {
  models: [__dirname + "/../models/**/*"],
  logging: false,
  dialectOptions: {
    ssl: {
      require: false,
    },
  },
});

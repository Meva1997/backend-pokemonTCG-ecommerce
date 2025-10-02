import express from "express";
import colors from "colors";
import morgan from "morgan";
import { db } from "./config/db";
import { seedCategories } from "./data/categories";
import usersRouter from "./routes/usersRouter";
import productsRouter from "./routes/productsRouter";
import categoriesRouter from "./routes/categoryRouter";
import orderRouter from "./routes/orderRouter";

async function connectDB() {
  try {
    await db.authenticate();
    await db.sync();
    // await db.sync({ force: true }); // CUIDADO: Esto borra todas las tablas y las recrea
    // await seedCategories(); // Crear categorías iniciales
    console.log(
      colors.blue.bold("Database connection established successfully")
    );
  } catch (error) {
    // console.log("Error connecting to the database", error);
    console.log(colors.red.bold("Error connecting to the database"));
  }
}
connectDB();

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/users", usersRouter); // Users routes
app.use("/api/products", productsRouter); // Products routes
app.use("/api/categories", categoriesRouter); // Categories routes
app.use("/api/orders", orderRouter); // Orders routes

export default app;

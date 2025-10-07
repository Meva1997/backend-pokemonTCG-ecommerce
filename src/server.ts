import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import { db } from "./config/db";
import { seedCategories } from "./data/categories";
import usersRouter from "./routes/usersRouter";
import productsRouter from "./routes/productsRouter";
import categoriesRouter from "./routes/categoryRouter";
import orderRouter from "./routes/orderRouter";
import authRouter from "./routes/authRouter";

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

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend en desarrollo
      "http://127.0.0.1:3000", // Alternativa localhost
    ],
    credentials: true, // Permite cookies y headers de autenticación
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/users", usersRouter); // Users routes
app.use("/api/products", productsRouter); // Products routes
app.use("/api/categories", categoriesRouter); // Categories routes
app.use("/api/orders", orderRouter); // Orders routes
app.use("/api/auth", authRouter); // Auth routes

export default app;

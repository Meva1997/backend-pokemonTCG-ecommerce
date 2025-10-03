# backend-pokemonTCG-ecommerce

Backend for a Pokémon TCG e-commerce platform, built with Node.js, Express.js, and TypeScript.

## 👔 Project Overview

This project demonstrates industry best practices for building a scalable, secure, and maintainable RESTful API for an online store. It covers user management, product catalog, categories, order processing, and authentication. The codebase uses modern technologies and patterns suitable for professional production environments.

## 🧩 Technical Stack & Architecture

- **Node.js** & **Express.js**: High-performance web server and routing.
- **TypeScript**: Type safety, maintainability, and developer productivity.
- **Sequelize ORM**: Robust database modeling and migrations.
- **JWT Authentication**: Secure stateless authentication and authorization.
- **express-validator**: Reliable request validation to prevent malformed data.
- **Modular structure**: Separation of concerns with routers, controllers, middlewares, and models.

## 🔗 Example API Endpoints

### Users

- `GET /api/users` — List all users (admin only)
- `POST /api/users` — Create a new user (admin only)
- `GET /api/users/:userId` — Get user details (admin only)
- `PUT /api/users/:userId` — Update user (admin only)
- `DELETE /api/users/:userId` — Delete user (admin only)

### Products

- `GET /api/products` — List products
- `POST /api/products` — Add product (admin only)
- `GET /api/products/:productId` — Get product details
- `PUT /api/products/:productId` — Update product (admin only)
- `DELETE /api/products/:productId` — Delete product (admin only)

### Authentication

- `POST /api/auth/create-account` — Register new account
- `POST /api/auth/login` — User login (returns JWT)
- `POST /api/auth/forgot-password` — Password recovery
- `POST /api/auth/update-password` — Password update
- `POST /api/auth/check-password` — Password check

### Orders

- `GET /api/orders` — List orders (user or admin)
- `POST /api/orders` — Create order (authenticated users)
- `GET /api/orders/:orderId` — View order (owner or admin)
- `PUT /api/orders/:orderId` — Update order (owner or admin)
- `DELETE /api/orders/:orderId` — Delete order (owner or admin)

## 🛡️ Security Features

- **JWT-based authentication** and role-based authorization for sensitive endpoints.
- **Password hashing** with bcrypt for storage safety.
- **Rate limiting** on authentication routes to mitigate brute-force attacks.
- **Input validation** to prevent common vulnerabilities and ensure data integrity.

## 🏗️ Project Structure

- `/src/controllers` — Business logic for each resource
- `/src/routes` — API endpoint definitions
- `/src/middleware` — Authentication, authorization, and validation logic
- `/src/models` — Sequelize models for database tables
- `/src/config` — Database connection and environment configuration

## 🧪 Testing

You are encouraged to add unit and integration tests using Jest or Mocha, ensuring code reliability and facilitating CI/CD workflows.

## ⚙️ Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Meva1997/backend-pokemonTCG-ecommerce.git
   cd backend-pokemonTCG-ecommerce
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file with:

   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```
   The API will be available on the configured port (`4000` by default).

## 📄 License

Consider adding a license (e.g., MIT) to clarify usage permissions.

---

**Interested in how this code can support your business goals or team? Reach out!**

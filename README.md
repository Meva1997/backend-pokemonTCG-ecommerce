# Pokémon TCG E-Commerce — Backend API

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Sequelize-336791?logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Production-ready REST API for a Pokémon TCG e-commerce platform. Handles authentication, product catalog, order management, and real Stripe payment processing. Designed with security, scalability, and clean architecture in mind.

---

## Screenshots

| Database Schema                                     | Postman Endpoints                                             |
| --------------------------------------------------- | ------------------------------------------------------------- |
| ![DB](src/public/backendScreenshots/pokeTCG-DB.png) | ![Postman](src/public/backendScreenshots/pokeTCG-postman.png) |

---

## Key Features

- **Stripe Payment Integration** — Full payment intent lifecycle: create intent → client-side confirmation → server-side fulfillment with idempotency guards
- **JWT Authentication** — Stateless auth with role-based access control (admin vs. regular user)
- **Secure by design** — bcrypt password hashing, rate limiting on sensitive routes, input validation on every endpoint, parameterized queries (no SQL injection risk)
- **Transactional order processing** — All order + stock updates run inside DB transactions with row-level locking to prevent race conditions
- **RESTful API** — Clean, consistent resource-based routing across users, products, categories, and orders
- **Type-safe codebase** — 100% TypeScript with strict Sequelize models

---

## Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Runtime          | Node.js 22                         |
| Framework        | Express.js 4                       |
| Language         | TypeScript 5                       |
| ORM              | Sequelize 6 (sequelize-typescript) |
| Database         | PostgreSQL (hosted on Render)      |
| Payments         | Stripe SDK v20                     |
| Auth             | JSON Web Tokens (jsonwebtoken)     |
| Password hashing | bcrypt                             |
| Validation       | express-validator                  |
| Rate limiting    | express-rate-limit                 |
| Dev tooling      | ts-node, nodemon                   |

---

## Project Structure

```
backend/src/
├── controllers/        # Business logic — one class per resource
│   ├── AuthController.ts
│   ├── PaymentsController.ts  # Stripe intent creation & confirmation
│   ├── OrderController.ts
│   ├── ProductsController.ts
│   ├── CategoryController.ts
│   └── UsersController.ts
├── routes/             # Express routers with validation middleware
├── middleware/
│   ├── auth.ts         # JWT verification & role guards
│   └── validation.ts   # express-validator error handler
├── models/             # Sequelize-typescript decorated models
│   ├── Order.ts
│   ├── OrderProduct.ts # Junction table (orderId, productId, qty, price)
│   ├── Payment.ts
│   ├── Product.ts
│   └── Users.ts
├── config/
│   ├── db.ts           # Sequelize instance
│   └── limiter.ts      # Rate limiter config
└── utils/
    ├── auth.ts         # Token helpers
    └── jwt.ts          # Sign / verify wrappers
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Meva1997/backend-pokemonTCG-ecommerce.git
cd backend-pokemonTCG-ecommerce

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your values (see below)

# Start the development server
npm run dev:api
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=rk_test_...   # Stripe restricted key (Payment Intents: read + write)
```

---

## API Reference

### Authentication

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | `/api/auth/create-account`  | Register a new user             |
| POST   | `/api/auth/login`           | Login — returns a signed JWT    |
| GET    | `/api/auth/user`            | Get current authenticated user  |
| POST   | `/api/auth/update-password` | Change password (authenticated) |

### Products

| Method | Endpoint            | Auth   | Description       |
| ------ | ------------------- | ------ | ----------------- |
| GET    | `/api/products`     | Public | List all products |
| GET    | `/api/products/:id` | Public | Get product by ID |
| POST   | `/api/products`     | Admin  | Create product    |
| PUT    | `/api/products/:id` | Admin  | Update product    |
| DELETE | `/api/products/:id` | Admin  | Delete product    |

### Categories

| Method | Endpoint              | Auth   | Description     |
| ------ | --------------------- | ------ | --------------- |
| GET    | `/api/categories`     | Public | List categories |
| POST   | `/api/categories`     | Admin  | Create category |
| PUT    | `/api/categories/:id` | Admin  | Update category |
| DELETE | `/api/categories/:id` | Admin  | Delete category |

### Orders

| Method | Endpoint                   | Auth       | Description         |
| ------ | -------------------------- | ---------- | ------------------- |
| GET    | `/api/orders`              | Admin      | List all orders     |
| GET    | `/api/orders/user/:userId` | User       | Orders by user      |
| GET    | `/api/orders/:id`          | User/Admin | Order detail        |
| PUT    | `/api/orders/:id`          | Admin      | Update order status |
| DELETE | `/api/orders/:id`          | Admin      | Delete order        |

### Payments (Stripe)

| Method | Endpoint                      | Auth | Description                                                                                                             |
| ------ | ----------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/payments/create-intent` | User | Create a Stripe PaymentIntent; validates stock, computes total (products + shipping + tax), creates a pending order     |
| POST   | `/api/payments/confirm`       | User | Verify Stripe payment success, decrement stock, update order to `paid`, record payment — all in a single DB transaction |

### Users (Admin)

| Method | Endpoint         | Auth  | Description    |
| ------ | ---------------- | ----- | -------------- |
| GET    | `/api/users`     | Admin | List all users |
| POST   | `/api/users`     | Admin | Create user    |
| GET    | `/api/users/:id` | Admin | User detail    |
| PUT    | `/api/users/:id` | Admin | Update user    |
| DELETE | `/api/users/:id` | Admin | Delete user    |

---

## Security Highlights

- All mutating endpoints require a valid JWT; admin-only routes enforce role check
- Passwords are hashed with bcrypt (never stored in plain text)
- Rate limiter applied to payment and auth routes to prevent brute-force
- Stripe amount mismatch detection — server compares Stripe's charged amount against stored order total before fulfillment
- DB transactions with `SELECT FOR UPDATE` row locks prevent double-order processing under concurrent requests

---

## License

MIT — see [LICENSE](./LICENSE) for details.

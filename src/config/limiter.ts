import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 15 requests per `window` (here, per 15 minutes)
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

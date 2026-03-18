import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import productRoutes from "./routes/product-routes";
import voucherRoutes from "./routes/voucher-routes";
import authRoutes from "./routes/auth-routes";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new OpenAPIHono();

// Middlewares
app.use("*", logger());
app.use("*", cors());

// Default Routes
app.get("/", (c) => {
  return c.json({
    message: "Wallet App API (Bun + Hono) is running!",
    docs: "/swagger-ui",
    ping: "/ping",
  });
});

app.get("/ping", (c) => {
  return c.json({ message: "pong" });
});

// Mount Routes
app.route("/products", productRoutes);
app.route("/vouchers", voucherRoutes);
app.route("/auth", authRoutes);

// OpenAPI Documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Wallet-app API",
    description: "Documentation for the Digital Currency Selling Website API",
  },
});

// Documentation UI (Matching reference project)
app.get("/api", apiReference({ 
  theme: "saturn",
  url: "/doc",
}));

console.log("🚀 Server is running on http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};

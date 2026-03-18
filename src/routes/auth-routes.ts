import { UserRepository } from "../repositories/user-repository";
import { AuthService } from "../services/auth-service";
import { authMiddleware } from "../lib/auth-middleware";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);

const router = new OpenAPIHono();

// OpenAPI Definitions
router.openapi(
  createRoute({
    method: "post",
    path: "/register",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email(),
              password: z.string().min(6),
              name: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      201: { description: "User registered", content: { "application/json": { schema: z.object({ token: z.string(), user: z.any() }) } } },
      400: { description: "Bad Request" },
    },
    tags: ["Auth"],
  }),
  authService.register as any
);

router.openapi(
  createRoute({
    method: "post",
    path: "/login",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email(),
              password: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: "Login successful", content: { "application/json": { schema: z.object({ token: z.string(), user: z.any() }) } } },
      401: { description: "Unauthorized" },
    },
    tags: ["Auth"],
  }),
  authService.login as any
);

router.openapi(
  createRoute({
    method: "get",
    path: "/google/login",
    responses: {
      302: { description: "Redirect to Google OAuth" },
    },
    tags: ["Auth"],
  }),
  authService.googleLogin as any
);

router.openapi(
  createRoute({
    method: "get",
    path: "/google/callback",
    request: {
      query: z.object({
        code: z.string().openapi({ example: "4/0AfgeX..." }),
      }),
    },
    responses: {
      302: { description: "Redirect to frontend with token" },
      400: { description: "Bad Request" },
    },
    tags: ["Auth"],
  }),
  authService.googleCallback as any
);

router.get("/me", authMiddleware, (c) => {
  const user = (c as any).get("user");
  return c.json({ user });
});

// Landing route to catch the final redirect for development/testing
router.get("/callback", (c) => {
  const token = c.req.query("token");
  return c.json({
    message: "Authentication successful!",
    token: token,
    usage: "Use this token in the 'Authorization: Bearer <token>' header"
  });
});

export default router;

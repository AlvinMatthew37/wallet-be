import { ProductService } from "../services/product-service";
import { ProductRepository } from "../repositories/product-repository";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ProductSchema, ProductWithVariantsSchema } from "../types/models";
import { z } from "zod";

const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);

const router = new OpenAPIHono();

// OpenAPI Definitions
router.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "Respond with a list of active products",
        content: {
          "application/json": {
            schema: z.array(ProductSchema),
          },
        },
      },
    },
    tags: ["Products"],
  }),
  productService.getAllProducts as any
);

router.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    request: {
      params: z.object({
        slug: z.string().openapi({ example: "steam-wallet-idr" }),
      }),
    },
    responses: {
      200: {
        description: "Respond with product details and variants",
        content: {
          "application/json": {
            schema: ProductWithVariantsSchema,
          },
        },
      },
      404: {
        description: "Product not found",
      },
    },
    tags: ["Products"],
  }),
  productService.getProductBySlug as any
);

export default router;

import { VoucherRepository } from "../repositories/voucher-repository";
import { VoucherService } from "../services/voucher-service";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { VoucherCodeSchema } from "../types/models";
import { z } from "zod";

const voucherRepo = new VoucherRepository();
const voucherService = new VoucherService(voucherRepo);

const router = new OpenAPIHono();

// OpenAPI Definitions
router.openapi(
  createRoute({
    method: "get",
    path: "/count",
    summary: "Get available voucher count",
    description: "Returns the number of available vouchers for a specific product variant.",
    request: {
      query: z.object({
        variantId: z.string().uuid().openapi({ example: "825810d1-32b4-4397-960e-018d116fe610" }),
      }),
    },
    responses: {
      200: {
        description: "Respond with the available voucher count",
        content: {
          "application/json": {
            schema: z.object({
              product_variant_id: z.string().uuid(),
              available_count: z.number(),
            }),
          },
        },
      },
      400: {
        description: "Missing required query parameters",
      },
    },
    tags: ["Vouchers"],
  }),
  voucherService.getAvailableCount as any
);

router.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Add a new voucher",
    description: "Inserts a new voucher code into the database for a specific product variant.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: VoucherCodeSchema.pick({
              product_variant_id: true,
              product_slug: true,
              variant_name: true,
              code: true,
            }).openapi({
              example: {
                product_variant_id: "825810d1-32b4-4397-960e-018d116fe610",
                product_slug: "steam-wallet-idr",
                variant_name: "60.000 Voucher",
                code: "60K-STEAM-XYZ",
              },
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Respond with the created voucher",
        content: {
          "application/json": {
            schema: VoucherCodeSchema,
          },
        },
      },
      400: {
        description: "Invalid request body",
      },
      500: {
        description: "Internal Server Error",
      },
    },
    tags: ["Vouchers"],
  }),
  voucherService.createVoucher as any
);

export default router;

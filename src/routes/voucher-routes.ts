import { VoucherRepository } from "../repositories/voucher-repository";
import { VoucherService } from "../services/voucher-service";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

const voucherRepo = new VoucherRepository();
const voucherService = new VoucherService(voucherRepo);

const router = new OpenAPIHono();

// OpenAPI Definitions
router.openapi(
  createRoute({
    method: "get",
    path: "/count",
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

export default router;

import type { Context } from "hono";
import { VoucherRepository } from "../repositories/voucher-repository";

export class VoucherService {
  constructor(private voucherRepo: VoucherRepository) {}

  getAvailableCount = async (c: Context) => {
    try {
      const variantId = c.req.query("variantId");

      if (!variantId) {
        return c.json({ error: "variantId is a required query parameter" }, 400);
      }

      const count = await this.voucherRepo.getAvailableCount(variantId);
      
      return c.json({ 
        product_variant_id: variantId,
        available_count: count 
      });
    } catch (error) {
      console.error("[VoucherService] Error in getAvailableCount:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };

  createVoucher = async (c: Context) => {
    try {
      const body = await c.req.json();
      
      // Basic validation (more robust validation will be handled by OpenAPI/Zod in the route)
      if (!body.product_variant_id || !body.code) {
        return c.json({ error: "product_variant_id and code are required" }, 400);
      }

      const voucher = await this.voucherRepo.createVoucher(
        body.product_variant_id,
        body.code,
        body.product_slug,
        body.variant_name
      );

      return c.json(voucher, 201);
    } catch (error) {
      console.error("[VoucherService] Error in createVoucher:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };
}


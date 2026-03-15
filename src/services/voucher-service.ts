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
}


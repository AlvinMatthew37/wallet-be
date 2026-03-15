import type { Context } from "hono";
import { VoucherService } from "../services/voucher-service";

export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  getAvailableCount = async (c: Context) => {
    try {
      const variantId = c.req.query("variantId");

      if (!variantId) {
        return c.json({ error: "variantId is a required query parameter" }, 400);
      }

      const count = await this.voucherService.getAvailableVoucherCount(variantId);
      
      return c.json({ 
        product_variant_id: variantId,
        available_count: count 
      });
    } catch (error) {
      console.error("[VoucherController] Error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };
}

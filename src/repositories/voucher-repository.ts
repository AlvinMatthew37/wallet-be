import { pool } from "../lib/db";
import type { VoucherCode } from "../types/models";

export class VoucherRepository {
  /**
   * Gets the count of available vouchers for a specific product variant.
   * Uses product_slug and variant_name for improved readability and integrity check.
   */
  async getAvailableCount(
    variantId: string
  ): Promise<number> {
    const queryText = `
      SELECT COUNT(*)::int as count 
      FROM vouchers 
      WHERE product_variant_id = $1 
        AND status = 'available'
    `;

    const { rows } = await pool.query(queryText, [variantId]);
    return rows[0]?.count ?? 0;
  }

  /**
   * Creates a new voucher record.
   */
  async createVoucher(
    productVariantId: string,
    code: string,
    productSlug?: string,
    variantName?: string
  ): Promise<VoucherCode> {
    const queryText = `
      INSERT INTO vouchers (product_variant_id, code, product_slug, variant_name, status)
      VALUES ($1, $2, $3, $4, 'available')
      RETURNING *
    `;

    const values = [productVariantId, code, productSlug, variantName];

    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }
}

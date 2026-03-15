import { pool } from "../lib/db";

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
}

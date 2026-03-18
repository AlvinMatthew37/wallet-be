import { pool } from "../lib/db";
import type { Product, ProductWithVariants, ProductVariant } from "../types/models";

export class ProductRepository {
  async getAll(onlyActive: boolean = true): Promise<ProductWithVariants[]> {
    const queryText = `
      SELECT *, 
        (
          SELECT COALESCE(json_agg(pv.*), '[]')
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) AS variants
      FROM products p
      ${onlyActive ? 'WHERE p.is_active = true' : ''}
    `;

    const { rows } = await pool.query(queryText);
    return rows as ProductWithVariants[];
  }

  async getBySlug(slug: string): Promise<ProductWithVariants | null> {
    const queryText = `
      SELECT *,
        (
          SELECT COALESCE(json_agg(pv.*), '[]')
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) AS variants
      FROM products p
      WHERE p.slug = $1
    `;

    const { rows } = await pool.query(queryText, [slug]);
    return rows.length > 0 ? (rows[0] as ProductWithVariants) : null;
  }

  async getById(id: string): Promise<ProductWithVariants | null> {
    const queryText = `
      SELECT p.*, 
             COALESCE(
               json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL), 
               '[]'
             ) as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const { rows } = await pool.query(queryText, [id]);
    return rows.length > 0 ? (rows[0] as ProductWithVariants) : null;
  }
}


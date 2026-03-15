import type { Context } from "hono";
import { ProductRepository } from "../repositories/product-repository";

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  getAllProducts = async (c: Context) => {
    try {
      const products = await this.productRepo.getAll();
      return c.json(products);
    } catch (error) {
      console.error("[ProductService] Error in getAllProducts:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };

  getProductBySlug = async (c: Context) => {
    try {
      const slug = c.req.param("slug");
      
      if (!slug) {
        return c.json({ error: "Missing slug parameter" }, 400);
      }

      const product = await this.productRepo.getBySlug(slug);
      
      if (!product) {
        return c.json({ error: "Product not found" }, 404);
      }
      
      return c.json(product);
    } catch (error) {
      console.error("[ProductService] Error in getProductBySlug:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };
}


import { Context } from "hono";
import { ProductService } from "../services/product-service";

export class ProductController {
  constructor(private productService: ProductService) {}

  getAllProducts = async (c: Context) => {
    try {
      const products = await this.productService.getAllProducts();
      return c.json(products);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };

  getProductBySlug = async (c: Context) => {
    try {
      const slug = c.req.param("slug");
      const product = await this.productService.getProductBySlug(slug);
      
      if (!product) {
        return c.json({ error: "Product not found" }, 404);
      }
      
      return c.json(product);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };
}

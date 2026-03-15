import { ProductRepository } from "../repositories/product-repository";

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getAllProducts(onlyActive: boolean = true) {
    return this.productRepo.getAll(onlyActive);
  }

  async getProductBySlug(slug: string) {
    return this.productRepo.getBySlug(slug);
  }
}

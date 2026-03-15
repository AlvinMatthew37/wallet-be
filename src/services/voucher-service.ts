import { VoucherRepository } from "../repositories/voucher-repository";

export class VoucherService {
  constructor(private voucherRepo: VoucherRepository) {}

  /**
   * Get the number of available vouchers for a specific variant.
   */
  async getAvailableVoucherCount(
    variantId: string
  ): Promise<number> {
    return this.voucherRepo.getAvailableCount(variantId);
  }
}

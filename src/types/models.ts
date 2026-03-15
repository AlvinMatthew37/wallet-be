import { z } from "zod";

export const BaseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const UserSchema = BaseSchema.extend({
  email: z.string().email(),
  name: z.string(),
  provider: z.string(),
  provider_id: z.string().nullable().optional(),
  role: z.enum(["user", "admin"]),
});

export const ProductSchema = BaseSchema.extend({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  image_url: z.string().url(),
  is_active: z.boolean(),
});

export const ProductVariantSchema = BaseSchema.extend({
  product_id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
});

export const VoucherCodeSchema = BaseSchema.extend({
  product_variant_id: z.string().uuid(),
  product_slug: z.string().optional(),
  variant_name: z.string().optional(),
  code: z.string(),
  status: z.enum(["available", "reserved", "sold"]),
  order_id: z.string().uuid().nullable().optional(),
  reserved_at: z.string().datetime().nullable().optional(),
});

export const ShoppingCartSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cart_id: z.string().uuid(),
  product_variant_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  created_at: z.string().datetime(),
});

export const OrderSchema = z.object({
  id: z.string(),
  user_id: z.string().uuid(),
  total_amount: z.number(),
  status: z.enum(["pending", "paid", "expired", "failed", "completed"]),
  payment_method: z.string(),
  created_at: z.string().datetime(),
  finished_at: z.string().datetime().nullable().optional(),
});

export const OrderItemSchema = BaseSchema.extend({
  order_id: z.string(),
  product_variant_id: z.string().uuid(),
  product_name_snapshot: z.string(),
  variant_name_snapshot: z.string(),
  price_at_purchase: z.number(),
  quantity: z.number().int().positive(),
});

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string(),
  gateway: z.string(),
  gateway_transaction_id: z.string(),
  amount: z.number(),
  status: z.string(),
  created_at: z.string().datetime(),
});

// Response Types (with joins)
export const ProductWithVariantsSchema = ProductSchema.extend({
  variants: z.array(ProductVariantSchema),
});

export const OrderWithItemsSchema = OrderSchema.extend({
  items: z.array(OrderItemSchema),
  payment: PaymentSchema.nullable().optional(),
});

export const CartWithItemsSchema = ShoppingCartSchema.extend({
  items: z.array(CartItemSchema),
});

export type User = z.infer<typeof UserSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type VoucherCode = z.infer<typeof VoucherCodeSchema>;
export type ShoppingCart = z.infer<typeof ShoppingCartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Payment = z.infer<typeof PaymentSchema>;

export type ProductWithVariants = z.infer<typeof ProductWithVariantsSchema>;
export type OrderWithItems = z.infer<typeof OrderWithItemsSchema>;
export type CartWithItems = z.infer<typeof CartWithItemsSchema>;

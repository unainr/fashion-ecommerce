import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────
export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  category: text('category', {
    enum: ['men', 'women', 'kids', 'accessories'],
  }),
  sizes: text('sizes', { mode: 'json' }).$type<string[]>(),
  images: text('images', { mode: 'json' }).$type<string[]>(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').default(sql`(current_timestamp)`),
})

// ─────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkUserId: text('clerk_user_id').notNull(),

  status: text('status', {
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  }).notNull().default('pending'),
  trackingId: text('tracking_id'),
  paymentMethod: text('payment_method').notNull().default('COD'),
  totalAmount: real('total_amount').notNull(),

  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  street: text('street').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code'),
  notes: text('notes'),

  createdAt: text('created_at').default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').default(sql`(current_timestamp)`),
})

// ─────────────────────────────────────────
// ORDER ITEMS
// ─────────────────────────────────────────
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),

  productTitle: text('product_title').notNull(),
  productImage: text('product_image'),
  priceAtPurchase: real('price_at_purchase').notNull(),

  quantity: integer('quantity').notNull(),
  size: text('size'),
})

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
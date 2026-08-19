import { z } from 'zod'

// shared enums — reuse across create/update
const categoryEnum = z.enum(['men', 'women', 'kids', 'accessories'])
const sizeEnum = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'])

export const productSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().min(0).default(0),
  category: categoryEnum,
  sizes: z.array(sizeEnum).min(1, 'Select at least one size').optional(),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1, 'At least one image is required'),
  isActive: z.boolean().default(true),
})

// PATCH — every field optional, but if provided must still pass the same rules
export const productUpdateSchema = productSchema.partial()

// for validating a single :id route param
export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

export const ParamsID = z.object({
    id:z.string(),
})
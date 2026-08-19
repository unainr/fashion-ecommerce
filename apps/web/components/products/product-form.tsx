"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { useCreateProduct } from "@/hooks/products-hooks/useproducts"
import { useUploadImage } from "@/hooks/use-upload"


const CATEGORIES = ["men", "women", "kids", "accessories"] as const
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters.").max(200),
  description: z.string().max(2000),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0),
  category: z
    .union([z.literal(""), z.enum(CATEGORIES)])
    .refine((category) => category !== "", "Select a category"),
  sizes: z.array(z.enum(SIZES)).min(1, "Select at least one size"),
  images: z.array(z.string()).min(1, "Upload at least one image"),
})

export function ProductForm() {
  const { mutate, isPending } = useCreateProduct()
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      stock: 0,
      category: "" as (typeof CATEGORIES)[number] | "",
      sizes: [] as (typeof SIZES)[number][],
      images: [] as string[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(
        {
          title: value.title,
          description: value.description || undefined,
          price: value.price,
          stock: value.stock,
          category: value.category as (typeof CATEGORIES)[number],
          sizes: value.sizes,
          images: value.images,
          isActive: true,
        },
        {
          onSuccess: () => {
            toast("Product created", {
              description: `"${value.title}" was added successfully.`,
              position: "bottom-right",
            })
            form.reset()
          },
          onError: (err) => {
            toast("Failed to create product", {
              description: err.message,
              position: "bottom-right",
            })
          },
        }
      )
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Add Product</CardTitle>
        <CardDescription>
          Create a new product. The URL slug is generated automatically from
          the title.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="product-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Blue Denim Jacket"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="description"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Classic fit, mid-wash denim jacket..."
                      rows={4}
                      className="min-h-20 resize-none"
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.state.value.length}/2000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )}
            />

            <form.Field
              name="price"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="49.99"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="stock"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="20"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="category"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      aria-invalid={isInvalid}
                      className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="sizes"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Sizes</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((size) => {
                        const checked = field.state.value.includes(size)
                        return (
                          <Badge
                            key={size}
                            variant={checked ? "default" : "outline"}
                            className="cursor-pointer select-none px-3 py-1"
                            onClick={() => {
                              if (checked) {
                                field.handleChange(
                                  field.state.value.filter((s) => s !== size)
                                )
                              } else {
                                field.handleChange([...field.state.value, size])
                              }
                            }}
                          >
                            {size}
                          </Badge>
                        )
                      })}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="images"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Images</FieldLabel>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        uploadImage(file, {
                          onSuccess: (data) => {
                            field.handleChange([...field.state.value, data.url])
                          },
                          onError: () => {
                            toast("Image upload failed", {
                              position: "bottom-right",
                            })
                          },
                        })

                        e.target.value = "" // allow re-selecting the same file
                      }}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Upload Image
                        </>
                      )}
                    </Button>

                    {field.state.value.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {field.state.value.map((url, i) => (
                          <div
                            key={url}
                            className="group relative aspect-square overflow-hidden rounded-md border"
                          >
                            <img
                              src={url}
                              alt={`Product image ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                field.handleChange(
                                  field.state.value.filter((u) => u !== url)
                                )
                              }
                              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="size-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <FieldDescription>
                      Upload one or more product images.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="product-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { useCreateProduct } from "@/hooks/products-hooks/useproducts";


const CATEGORIES = ["men", "women", "kids", "accessories"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const formSchema = z.object({
	title: z.string().min(2, "Title must be at least 2 characters.").max(200),
	description: z.string().max(2000),
	price: z.number().positive("Price must be greater than 0"),
	stock: z.number().int().min(0),
	category: z
		.union([z.literal(""), z.enum(CATEGORIES)])
		.refine((category) => category !== "", "Select a category"),
	sizes: z.array(z.enum(SIZES)).min(1, "Select at least one size"),
	images: z.string().min(1, "Add at least one image URL"), // raw textarea, split on submit
});

export function ProductForm() {
	const { mutate, isPending } = useCreateProduct();

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			price: 0,
			stock: 0,
			category: "" as (typeof CATEGORIES)[number] | "",
			sizes: [] as (typeof SIZES)[number][],
			images: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			// slug is generated here, never taken as user input

			mutate(
				{
					title: value.title,
					description: value.description || undefined,
					price: value.price,
					stock: value.stock,
					category: value.category as (typeof CATEGORIES)[number],
					sizes: value.sizes,
					images: value.images
						.split(",")
						.map((url) => url.trim())
						.filter(Boolean),
					isActive: true,
				},
				{
					onSuccess: () => {
						toast("Product created", {
							description: `"${value.title}" was added successfully.`,
							position: "bottom-right",
						});
						form.reset();
					},
					onError: (err) => {
						toast("Failed to create product", {
							description: err.message,
							position: "bottom-right",
						});
					},
				},
			);
		},
	});

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Add Product</CardTitle>
				<CardDescription>
					Create a new product. The URL slug is generated automatically from the
					title.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="product-form"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}>
					<FieldGroup>
                        <form.Field
							name="title"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
								);
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
									field.state.meta.isTouched && !field.state.meta.isValid;
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
								);
							}}
						/>

						<form.Field
							name="stock"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
								);
							}}
						/>

						<form.Field
							name="category"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Category</FieldLabel>
										<select
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(e.target.value as any)
											}
											aria-invalid={isInvalid}
											className="border-input h-9 rounded-md border bg-transparent px-3 text-sm">
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
								);
							}}
						/>

						<form.Field
							name="sizes"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>Sizes</FieldLabel>
										<div className="flex flex-wrap gap-2">
											{SIZES.map((size) => {
												const checked = field.state.value.includes(size);
												return (
													<label
														key={size}
														className="flex items-center gap-1 text-sm">
														<input
															type="checkbox"
															checked={checked}
															onChange={(e) => {
																if (e.target.checked) {
																	field.handleChange([
																		...field.state.value,
																		size,
																	]);
																} else {
																	field.handleChange(
																		field.state.value.filter((s) => s !== size),
																	);
																}
															}}
														/>
														{size}
													</label>
												);
											})}
										</div>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						<form.Field
							name="images"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Image URLs</FieldLabel>
										<InputGroupTextarea
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="https://ik.imagekit.io/.../img1.jpg, https://ik.imagekit.io/.../img2.jpg"
											rows={3}
											className="min-h-16 resize-none"
										/>
										<FieldDescription>
											Comma-separated ImageKit URLs.
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
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
						{isPending ? "Creating..." : "Create Product"}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}

"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { useUpdateProduct } from "@/hooks/products-hooks/useproducts";
import { useUploadImage } from "@/hooks/use-upload";

const CATEGORIES = ["men", "women", "kids", "accessories"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const formSchema = z.object({
	title: z.string().min(2, "Title must be at least 2 characters.").max(200),
	description: z.string().max(2000),
	price: z.number().positive("Price must be greater than 0"),
	stock: z.number().int().min(0),
	category: z.enum(CATEGORIES),
	sizes: z.array(z.enum(SIZES)).min(1, "Select at least one size"),
	images: z.array(z.string()).min(1, "Upload at least one image"),
	isActive: z.boolean(),
});

// keeping this loose on purpose — it just needs to match whatever your
// GET /products row shape is, not a strict duplicate of the DB schema
type ProductRow = {
	id: string;
	title: string;
	description: string | null;
	price: number;
	stock: number;
	category: (typeof CATEGORIES)[number];
	sizes: (typeof SIZES)[number][];
	images: string[];
	isActive: boolean;
};

export function ProductEditDialog({
	product,
	open,
	onOpenChange,
}: {
	product: ProductRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { mutate, isPending } = useUpdateProduct();
	const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const form = useForm({
		defaultValues: {
			title: product?.title ?? "",
			description: product?.description ?? "",
			price: product?.price ?? 0,
			stock: product?.stock ?? 0,
			category: (product?.category ?? "men") as (typeof CATEGORIES)[number],
			sizes: product?.sizes ?? [],
			images: product?.images ?? [],
			isActive: product?.isActive ?? true,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			if (!product) return;

			mutate(
				{ id: product.id, json: value },
				{
					onSuccess: () => {
						toast("Product updated", {
							description: `"${value.title}" was saved.`,
							position: "bottom-right",
						});
						onOpenChange(false);
					},
					onError: (err) => {
						toast("Failed to update product", {
							description: err.message,
							position: "bottom-right",
						});
					},
				},
			);
		},
	});

	// re-seed the form whenever a different product is opened —
	// tanstack-form's defaultValues only apply on first mount, so without
	// this every row would show whichever product was edited first
	React.useEffect(() => {
		if (product && open) {
			form.reset({
				title: product.title,
				description: product.description ?? "",
				price: product.price,
				stock: product.stock,
				category: product.category,
				sizes: product.sizes,
				images: product.images,
				isActive: product.isActive,
			});
		}
	}, [product, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Product</DialogTitle>
					<DialogDescription>
						Update the details below and save your changes.
					</DialogDescription>
				</DialogHeader>

				<form
					id="product-edit-form"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
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
											className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
										>
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
													<Badge
														key={size}
														variant={checked ? "default" : "outline"}
														className="cursor-pointer select-none px-3 py-1"
														onClick={() => {
															if (checked) {
																field.handleChange(
																	field.state.value.filter((s) => s !== size),
																);
															} else {
																field.handleChange([
																	...field.state.value,
																	size,
																]);
															}
														}}
													>
														{size}
													</Badge>
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
							name="isActive"
							children={(field) => (
								<Field>
									<FieldLabel>Visibility</FieldLabel>
									<div className="flex gap-2">
										<Badge
											variant={field.state.value ? "default" : "outline"}
											className="cursor-pointer select-none px-3 py-1"
											onClick={() => field.handleChange(true)}
										>
											Active
										</Badge>
										<Badge
											variant={!field.state.value ? "default" : "outline"}
											className="cursor-pointer select-none px-3 py-1"
											onClick={() => field.handleChange(false)}
										>
											Hidden
										</Badge>
									</div>
								</Field>
							)}
						/>

						<form.Field
							name="images"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>Images</FieldLabel>

										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (!file) return;

												uploadImage(file, {
													onSuccess: (data) => {
														field.handleChange([
															...field.state.value,
															data.url,
														]);
													},
													onError: () => {
														toast("Image upload failed", {
															position: "bottom-right",
														});
													},
												});

												e.target.value = "";
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
																	field.state.value.filter((u) => u !== url),
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
								);
							}}
						/>
					</FieldGroup>
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" form="product-edit-form" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
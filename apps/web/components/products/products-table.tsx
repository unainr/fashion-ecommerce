"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, ImageOff } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	useDeleteProduct,
	useProducts,
} from "@/hooks/products-hooks/useproducts";
import { ProductEditDialog } from "./product-edit-dialog";

// your images field can be string[] (old) or {url, fileId}[] (current) —
// this normalizes either shape so the table doesn't care which
function getFirstImageUrl(images: unknown): string | null {
	if (!Array.isArray(images) || images.length === 0) return null;
	const first = images[0];
	if (typeof first === "string") return first;
	if (first && typeof first === "object" && "url" in first) {
		return (first as { url: string }).url;
	}
	return null;
}

export function ProductsTable() {
	const { data: products, isLoading, isError } = useProducts();
	const [editProduct, setEditProduct] = React.useState<any | null>(null);

	const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
	const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(
		null,
	);

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<p className="text-muted-foreground py-8 text-center text-sm">
				Couldn't load products. Try refreshing.
			</p>
		);
	}

	if (!Array.isArray(products) || products.length === 0) {
		return (
			<p className="text-muted-foreground py-8 text-center text-sm">
				No products yet — add your first one above.
			</p>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-14">Image</TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Stock</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-12 text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.map((product: any) => {
						const imageUrl = getFirstImageUrl(product.images);
						return (
							<TableRow key={product.id}>
								<TableCell>
									{imageUrl ? (
										<img
											src={imageUrl}
											alt={product.title}
											className="size-10 rounded-md border object-cover"
										/>
									) : (
										<div className="bg-muted flex size-10 items-center justify-center rounded-md border">
											<ImageOff className="text-muted-foreground size-4" />
										</div>
									)}
								</TableCell>

								<TableCell className="font-medium">{product.title}</TableCell>

								<TableCell>
									<Badge variant="outline" className="capitalize">
										{product.category}
									</Badge>
								</TableCell>

								<TableCell>
									{new Intl.NumberFormat("en-US", {
										style: "currency",
										currency: "USD",
									}).format(product.price)}
								</TableCell>

								<TableCell>
									<span
										className={
											product.stock === 0
												? "text-destructive font-medium"
												: undefined
										}>
										{product.stock}
									</span>
								</TableCell>

								<TableCell>
									<Badge variant={product.isActive ? "default" : "secondary"}>
										{product.isActive ? "Active" : "Hidden"}
									</Badge>
								</TableCell>

								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="size-8">
												<MoreHorizontal className="size-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onSelect={(e) => {
													e.preventDefault();
													setEditProduct(product);
												}}>
												<Pencil className="size-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onSelect={(e) => {
													e.preventDefault();
													setPendingDeleteId(product.id);
												}}>
												<Trash2 className="size-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<ProductEditDialog
				product={editProduct}
				open={editProduct !== null}
				onOpenChange={(open) => !open && setEditProduct(null)}
			/>
			<AlertDialog
				open={pendingDeleteId !== null}
				onOpenChange={(open) => !open && setPendingDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this product?</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes the product and its images from ImageKit.
							This can't be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							onClick={() => {
								if (pendingDeleteId) {
									deleteProduct(pendingDeleteId, {
										onSettled: () => setPendingDeleteId(null),
									});
								}
							}}>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

import { useHonoClient } from "@/lib/hono";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono/client";
import { toast } from "sonner";

export function useProducts() {
	const client = useHonoClient(); // one line

	return useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const res = await client.api.products.$get();
			if (!res.ok) toast.error("Failed to fetch products");
			return res.json();
		},
	});
}

// products create hook

export const useCreateProduct = () => {
	const client = useHonoClient(); // one line

	const queryClient = useQueryClient();
	type ResponseType = InferResponseType<typeof client.api.products.$post, 201>;
	type RequestType = InferRequestType<typeof client.api.products.$post>["json"];
	return useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.products.$post({ json });

			if (!response.ok) {
				throw new Error("Failed to create product");
			}

			return await response.json();
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});
};


// delete products
export const useDeleteProduct = () => {
	const client = useHonoClient();
	const queryClient = useQueryClient();

	return useMutation<{ success: boolean }, Error, string>({
		mutationFn: async (id) => {
			const response = await client.api.products[":id"].$delete({
				param: { id },
			});

			if (!response.ok) {
				throw new Error("Failed to delete product");
			}

			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product deleted");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});
};

// update product
export const useUpdateProduct = () => {
	const client = useHonoClient();
	const queryClient = useQueryClient();

	type ResponseType = InferResponseType<typeof client.api.products[":id"]["$patch"]>;
  type RequestType = InferRequestType<typeof client.api.products[":id"]["$patch"]>["json"];

	return useMutation<ResponseType, Error, { id: string; json: RequestType }>({
		mutationFn: async ({ id, json }) => {
			const response = await client.api.products[":id"].$patch({
				param: { id },
				json,
			});

			if (!response.ok) {
				throw new Error("Failed to update product");
			}

			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});
};
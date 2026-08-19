import { useHonoClient } from "@/lib/hono"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono/client";
import { toast } from "sonner";

export function useProducts() {
      const client = useHonoClient()  // one line

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await client.api.products.$get()
      if (!res.ok)  toast.error("Failed to fetch products");
      return res.json()
    },
  })
}



// products create hook

export const useCreateProduct = () => {
    type ResponseType = InferResponseType<typeof client.api.products.$post,201>
    type RequestType = InferRequestType<typeof client.api.products.$post>["json"]
      const client = useHonoClient()  // one line

    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            
            const response = await client.api.products.$post({json});
            
            if (!response.ok) {
                throw new Error("Failed to create product");
            }

            return await response.json();
        },

        onSuccess: () => {
			 queryClient.invalidateQueries({ queryKey: ['products'] })

        },
    })
}
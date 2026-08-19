"use client"

import { useHonoClient } from "@/lib/hono"
import { useMutation } from "@tanstack/react-query"
import type { InferResponseType } from "hono/client"

export const useUploadImage = () => {
  const client = useHonoClient()

  const $post = client.api.upload.$post
  type ResponseType = InferResponseType<typeof $post, 201>

  return useMutation<ResponseType, Error, File>({
    mutationFn: async (file) => {
      const response = await $post({ form: { file } })
      if (!response.ok) {
        throw new Error("Failed to upload image")
      }
      return await response.json()
    },
  })
}
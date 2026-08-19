"use client"

import { hc } from "hono/client"
import { useAuth } from "@clerk/nextjs"
import type { AppType } from "@workspace/api"

export function useHonoClient() {
  const { getToken } = useAuth()

  return hc<AppType>(process.env.NEXT_PUBLIC_API_URL!, {
    headers: async (): Promise<Record<string, string>> => {
      const token = await getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  })
}
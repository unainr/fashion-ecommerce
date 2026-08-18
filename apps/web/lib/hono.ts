import { hc } from "hono/client"
import type { AppType } from "@workspace/api"
import { auth } from "@clerk/nextjs/server"

export const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL!, {
  headers: async () => {
    const { getToken } = await auth()
    const token = await getToken()
    return { Authorization: `Bearer ${token}` }
  },
})
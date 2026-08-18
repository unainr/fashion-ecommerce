import { Hono } from "hono"
import { cors } from "hono/cors"
import { clerkMiddleware } from "@clerk/hono"
import products from "./routes/products"


const app = new Hono<{ Bindings: CloudflareBindings }>()
  .basePath("/api")
  .use("*", (c, next) =>
    cors({
      origin: c.env.WEB_URL,
      credentials: true,
    })(c, next)
  )
  .use("*", (c, next) =>
    clerkMiddleware({
      publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
      secretKey: c.env.CLERK_SECRET_KEY,
    })(c, next)
  )

const routes = app.route("/products", products)
export type AppType = typeof routes
export default app

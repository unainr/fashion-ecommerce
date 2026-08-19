import { Hono } from "hono";
import { requireUser } from "../middleware/auth";



const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)
	.post("/", async (c) => {
  const body = await c.req.parseBody()
  const file = body.file

  if (!file || typeof file === "string") {
    return c.json({ error: "No file provided" }, 400)
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("fileName", `${Date.now()}-${Math.random()}.png`)
  formData.append("folder", "/products")

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(c.env.IMAGEKIT_PRIVATE_KEY + ":")}`,
    },
    body: formData,
  })

  if (!res.ok) {
    return c.json({ error: "Upload failed" }, 500)
  }

  const data = await res.json<{ url: string }>()
  return c.json({ url: data.url ?? null }, 201)
})
.delete("/:fileId", async (c) => {
  const { fileId } = c.req.param()

  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Basic ${btoa(c.env.IMAGEKIT_PRIVATE_KEY + ":")}` },
  })

  if (!res.ok && res.status !== 404) {
    return c.json({ error: "Failed to delete image" }, 500)
  }

  return c.json({ success: true })
})
export default app;

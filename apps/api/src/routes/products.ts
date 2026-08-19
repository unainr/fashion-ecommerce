import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { zValidator } from "@hono/zod-validator";
import { eq, sql } from "drizzle-orm";
import { createDb } from "../db";
import { products } from "../db/schema";
import {
	ParamsID,
	productSchema,
	productUpdateSchema,
} from "../schema/products-schema";
import { generateSlug } from "../utils/utils";

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)
	.get("/", async (c) => {
		const db = createDb(c.env);
		const result = await db.select().from(products);
		return c.json(result);
	})
	.get("/:id", zValidator("param", ParamsID), async (c) => {
		const db = createDb(c.env);
		const { id } = c.req.valid("param");
		const [product] = await db
			.select()
			.from(products)
			.where(eq(products.id, id));
		if (!product) return c.json({ error: "Product not found" }, 404);
		return c.json(product);
	})
	.post("/", zValidator("json", productSchema), async (c) => {
		const db = createDb(c.env);
		const {
			title,
			description,
			price,
			stock,
			category,
			sizes,
			images,
			isActive,
		} = await c.req.valid("json");
		const slug = generateSlug(title);
		const data = {
			title,
			slug,
			description,
			price,
			stock,
			category,
			sizes,
			images,
			isActive,
		};
		const [created] = await db.insert(products).values(data).returning();
		return c.json(created, 201);
	})
	.patch(
		"/:id",
		zValidator("param", ParamsID),
		zValidator("json", productUpdateSchema),
		async (c) => {
			const db = createDb(c.env);
			const { id } = c.req.valid("param");
			const data = c.req.valid("json");
			const [updated] = await db
				.update(products)
				.set({ ...data, updatedAt: sql`(current_timestamp)` })
				.where(eq(products.id, id))
				.returning();
			if (!updated) return c.json({ error: "Product not found" }, 404);
			return c.json(updated);
		},
	)
	.delete("/:id", zValidator("param", ParamsID), async (c) => {
		const db = createDb(c.env);
		const { id } = c.req.valid("param");
		const [deleted] = await db
			.delete(products)
			.where(eq(products.id, id))
			.returning();
		if (!deleted) return c.json({ error: "Product not found" }, 404);
		return c.json({ success: true });
	});

export default app;

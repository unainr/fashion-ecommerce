import { Hono } from "hono"
import {  requireUser } from "../middleware/auth"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { createDb } from "../db"

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  .get("/",async (c)=>{
const db = createDb(c.env)

return c.json("hellow world")
    
  })

export default app
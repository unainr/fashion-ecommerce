import { defineConfig } from 'drizzle-kit'
import {config} from 'dotenv'
config({path:'./.dev.vars'});
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})
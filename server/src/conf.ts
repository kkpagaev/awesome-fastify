import { z } from "zod"
import * as dotenv from "dotenv"

dotenv.config()

const configSchema = z.object({
  PORT: z.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
})

export type Config = z.infer<typeof configSchema>

export const config: Config = configSchema.parse(process.env)

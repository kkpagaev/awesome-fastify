import { z } from "zod"
import * as dotenv from "dotenv"

dotenv.config()

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .default("postgresql://user:user@localhost:6432/user?schema=public"),
  JWT_SECRET: z.string().default("secret"),
})

export type Config = z.infer<typeof configSchema>

export const config: Config = configSchema.parse(process.env)

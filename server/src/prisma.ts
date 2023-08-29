import { PrismaClient } from "@prisma/client"
import { config } from "./conf"

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL,
    },
  },
})

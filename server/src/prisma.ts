/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PrismaClient } from "@prisma/client"
import { config } from "./conf"

function createClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: config.DATABASE_URL,
      },
    },
  })
}

// @ts-ignore
export const prisma: PrismaClient = !process.env.SKIP_BOOTSTRAP
  ? createClient()
  : undefined

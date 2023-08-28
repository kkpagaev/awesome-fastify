import "./conf"

import Fastify, { FastifyInstance, RouteOptions } from "fastify"
import { PrismaClient } from "@prisma/client"
import { prisma } from "./prisma"
import formBody from "@fastify/formbody"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import fp from "fastify-plugin"
import fastifyCors from "@fastify/cors"
import type { User } from "@prisma/client"

import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod"
import { z } from "zod"

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient
  }

  // eslint-disable-next-line no-unused-vars
  interface FastifyRequest {
    user?: User
  }
}

const swaggerPlugin = fp(async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      host: "localhost:3000",
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header",
        },
      },
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: "/swagger",
  })
})

const fastify = Fastify({
  logger: true,
})

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

export const route = () => {
  return fastify.withTypeProvider<ZodTypeProvider>().route
}

export type HanlderType = Parameters<ReturnType<typeof route>>[0]

async function main() {
  await fastify.register(formBody)

  await fastify.register(swaggerPlugin)

  fastify.get("/hello", async () => {
    return { hello: "world" }
  })

  const { plugin, prefix } = await import("./http")
  await fastify.register(plugin, {
    prefix,
  })

  await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })

  await fastify.ready()
  fastify.swagger()

  const start = async () => {
    try {
      await fastify.listen({ port: conf.PORT })
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }

  await start()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

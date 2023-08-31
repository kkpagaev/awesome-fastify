import "./conf"
import "./globals"

import Fastify from "fastify"
import { PrismaClient } from "@prisma/client"
import { prisma } from "./prisma"
import formBody from "@fastify/formbody"
// import swagger from "@fastify/swagger"
// import swaggerUi from "@fastify/swagger-ui"
import fastifyCors from "@fastify/cors"
import { ZodSchema } from "zod"
import { autoRoute } from "./helpers/autoRoute"
import { HttpException } from "./http/exceptions/http-exception"
import { UnprocessableEntityException } from "./http/exceptions"

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

// const swaggerPlugin = fp(async (fastify: FastifyInstance) => {
//   await fastify.register(swagger, {
//     swagger: {
//       info: {
//         title: "Test swagger",
//         description: "Testing the Fastify swagger API",
//         version: "0.1.0",
//       },
//       host: "localhost:3000",
//       consumes: ["application/json"],
//       produces: ["application/json"],
//       securityDefinitions: {
//         apiKey: {
//           type: "apiKey",
//           name: "apiKey",
//           in: "header",
//         },
//       },
//     },
//   })
//
//   await fastify.register(swaggerUi, {
//     routePrefix: "/swagger",
//   // })
// })

async function main() {
  const fastify = Fastify({
    logger: true,
  })

  await fastify.register(formBody)

  // await fastify.register(swaggerPlugin)

  fastify.get("/hello", async () => {
    return { hello: "world" }
  })

  fastify
    .setValidatorCompiler(({ schema }: { schema: ZodSchema }) => {
      return (data) => {
        const result = schema.safeParse(data)
        if (result.success === true) {
          return result.data
        } else {
          throw new UnprocessableEntityException(result.error.errors)
        }
      }
    })
    .setErrorHandler<HttpException>(async (error, request, reply) => {
      if ("status" in error) {
        return reply.status(error.status).send({
          status: error.status,
          message: error.message,
          details: error.details,
        })
      } else {
        request.server.log.error(error)

        return reply.status(500).send({
          status: 500,
          message: "Internal Server Error",
        })
      }
    })

  // auto import
  const apiPrefix = "api/v1"
  const routesPath = "src/http/v1"

  await fastify.register(await autoRoute(routesPath, apiPrefix), {
    prefix: apiPrefix,
  })

  await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
  await fastify.ready()

  // fastify.swagger()

  const start = async () => {
    try {
      await fastify.listen({ port: env.PORT })
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

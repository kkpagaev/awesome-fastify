import { ZodTypeAny, z } from "zod"
import { Route, createRoute } from "./helpers/createRoute"
import { PrismaClient } from "@prisma/client"
import { config } from "./conf"
import { prisma } from "./prisma"
import { Config } from "./conf"
import { FastifyRequest, RouteOptions } from "fastify"

declare global {
  function createRoute<
    B extends ZodTypeAny,
    Q extends ZodTypeAny,
    P extends ZodTypeAny,
    H extends ZodTypeAny,
    Request extends FastifyRequest<{
      Body: z.infer<B>
      Querystring: z.infer<Q>
      Params: z.infer<P>
      Headers: z.infer<H>
    }>
  >(route: Route<B, Q, P, H, Request>): RouteOptions

  // eslint-disable-next-line no-var
  var prisma: PrismaClient
  // eslint-disable-next-line no-var
  var env: Config
}

global.env = config
global.createRoute = createRoute
global.prisma = prisma

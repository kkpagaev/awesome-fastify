import { ZodTypeAny } from "zod"
import { Route, createRoute } from "./helpers/createRoute"
import { PrismaClient } from "@prisma/client"
import { config } from "./conf"
import { prisma } from "./prisma"
import { Config } from "./conf"
import { RouteOptions } from "fastify"

declare global {
  function createRoute<
    T extends ZodTypeAny,
    Q extends ZodTypeAny,
    P extends ZodTypeAny,
    H extends ZodTypeAny
  >(route: Route<T, Q, P, H>): RouteOptions

  // eslint-disable-next-line no-var
  var prisma: PrismaClient
  // eslint-disable-next-line no-var
  var env: Config
}

global.env = config
global.createRoute = createRoute
global.prisma = prisma

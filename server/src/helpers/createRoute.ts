import {
  HTTPMethods,
  FastifyRequest,
  FastifyReply,
  RouteOptions,
  FastifySchema,
  preHandlerAsyncHookHandler,
  onRequestHookHandler,
} from "fastify"
import { ZodTypeAny, z } from "zod"
import { requireAuth } from "../http/hooks/require-auth"
import type { User } from "@prisma/client"

export type Route<
  Body extends ZodTypeAny,
  Query extends ZodTypeAny,
  Params extends ZodTypeAny,
  Headers extends ZodTypeAny
> = {
  method?: HTTPMethods
  body?: Body
  query?: Query
  url?: string
  params?: Params
  headers?: Headers
  preHandlers?: Array<preHandlerAsyncHookHandler>
} & (
  | {
      auth: true
      handler: (
        req: FastifyRequest<{
          Body: z.infer<Body>
          Querystring: z.infer<Query>
          Params: z.infer<Params>
          Headers: z.infer<Headers>
        }> & {
          user: User
        },
        rep: FastifyReply
      ) => any
    }
  | {
      auth?: false
      handler: (
        req: FastifyRequest<{
          Body: z.infer<Body>
          Querystring: z.infer<Query>
          Params: z.infer<Params>
          Headers: z.infer<Headers>
        }>,
        rep: FastifyReply
      ) => any
    }
)

export type CreateRouteOptionsGenerator = (
  name: string,
  method: HTTPMethods
) => RouteOptions

export function createRoute<
  T extends ZodTypeAny,
  Q extends ZodTypeAny,
  P extends ZodTypeAny,
  H extends ZodTypeAny
>(route: Route<T, Q, P, H>): CreateRouteOptionsGenerator {
  const schema: FastifySchema = {}
  if (route.body) schema.body = route.body
  if (route.query) schema.querystring = route.query
  if (route.params) schema.params = route.params
  if (route.headers) schema.headers = route.headers

  const onRequest = Array<onRequestHookHandler>(0)
  if (route.auth) onRequest.push(requireAuth)

  return (url, method) => {
    return {
      url: route.url ?? url ?? "/",
      method: route.method ?? method ?? "GET",
      schema: schema,
      preHandler: route.preHandlers ?? [],
      onRequest: onRequest,
      handler: route.handler,
    }
  }
}

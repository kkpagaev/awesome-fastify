import {
  HTTPMethods,
  FastifyRequest,
  FastifyReply,
  RouteOptions,
  FastifySchema,
} from "fastify"
import { ZodTypeAny, z } from "zod"

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

export function createRoute<
  T extends ZodTypeAny,
  Q extends ZodTypeAny,
  P extends ZodTypeAny,
  H extends ZodTypeAny
>(route: Route<T, Q, P, H>): RouteOptions {
  const schema: FastifySchema = {}
  if (route.body) schema.body = route.body
  if (route.query) schema.querystring = route.query
  if (route.params) schema.params = route.params
  if (route.headers) schema.headers = route.headers

  return <RouteOptions>{
    url: route.url ?? "/",
    method: route.method ?? "GET",
    schema: schema,
    handler: route.handler,
  }
}

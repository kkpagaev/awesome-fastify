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
import { HttpException } from "../http/exceptions"

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
  guard?: Array<{
    // if handler returns true throw error
    handler: (
      req: FastifyRequest<{
        Body: z.infer<Body>
        Querystring: z.infer<Query>
        Params: z.infer<Params>
        Headers: z.infer<Headers>
      }>
    ) => boolean | Promise<boolean>
    error: () => HttpException
  }>
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

  const onRequest = Array<onRequestHookHandler>(0)
  if (route.auth) onRequest.push(requireAuth)

  let preHandler = route.preHandlers ?? []

  if (route.guard) {
    const guards = route.guard.map(({ handler, error }) => {
      return async (req: any) => {
        if (await handler(req)) {
          throw error()
        }
      }
    })
    preHandler = preHandler.concat(guards)
  }

  return {
    url: route.url ?? "/",
    method: route.method ?? "GET",
    schema: schema,
    preHandler: preHandler,
    onRequest: onRequest,
    handler: route.handler,
  }
}

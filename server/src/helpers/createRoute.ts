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
import type { Role, User } from "@prisma/client"
import { requireAuth } from "../hooks/require-auth"
import { requireRoles } from "../hooks/require-roles"

type Guard<TRequest extends FastifyRequest> = (req: TRequest) => Promise<any>

export type Route<
  Body extends ZodTypeAny,
  Query extends ZodTypeAny,
  Params extends ZodTypeAny,
  Headers extends ZodTypeAny,
  Request extends FastifyRequest<{
    Body: z.infer<Body>
    Querystring: z.infer<Query>
    Params: z.infer<Params>
    Headers: z.infer<Headers>
  }>
> = {
  method?: HTTPMethods
  body?: Body
  query?: Query
  url?: string
  params?: Params
  headers?: Headers
  preHandlers?: Array<preHandlerAsyncHookHandler>
  roles?: Array<Role>
} & (
  | {
      auth: true
      handler: (
        req: Request & {
          user: User
        },
        rep: FastifyReply
      ) => any
      guard?:
        | Array<Guard<Request & { user: User }>>
        | Guard<Request & { user: User }>
    }
  | {
      auth?: false
      handler: (req: Request, rep: FastifyReply) => any
      guard?: Array<Guard<Request>> | Guard<Request>
    }
)

export function createRoute<
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
>(route: Route<B, Q, P, H, Request>): RouteOptions {
  const schema: FastifySchema = {}
  if (route.body) schema.body = route.body
  if (route.query) schema.querystring = route.query
  if (route.params) schema.params = route.params
  if (route.headers) schema.headers = route.headers

  const onRequest = Array<onRequestHookHandler>(0)

  if (route.roles) {
    onRequest.push(requireAuth)
    onRequest.push(requireRoles(route.roles))
  } else if (route.auth) {
    onRequest.push(requireAuth)
  }

  let preHandler = route.preHandlers ?? []

  if (route.guard) {
    preHandler = preHandler.concat(
      Array.isArray(route.guard) ? route.guard : [route.guard]
    )
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

import { FastifyReply, FastifyRequest, RouteOptions } from "fastify"
import { z } from "zod"
import { requireAuth } from "../../hooks/require-auth"

const BodySchema = z.object({
  id: z.enum(["foo", "bar"]),
})

export const options: RouteOptions = {
  method: "POST",
  url: "/",
  schema: {
    body: BodySchema,
  },
  preHandler: [requireAuth],
  handler: async ({ body }, rep) => {
    return rep.code(200).send({
      foo: body.id,
    })
  },
}

class Route<TBody> {
  _body: TBody

  constructor(body: TBody) {
    this._body = body
  }

  body(body: TBody) {
    this._body = body

    return this
  }
}

const route = () => {}
route()
  .body(
    z.object({
      id: z.enum(["foo", "bar"]),
    })
  )
  .handler(({ body }) => {
    console.log(body)
  })

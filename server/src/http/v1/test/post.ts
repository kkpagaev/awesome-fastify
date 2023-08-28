import { FastifyRequest, RouteOptions } from "fastify"
import { z } from "zod"
import { requireAuth } from "../../hooks/require-auth"
import { HanlderType, route } from "../../.."

const BodySchema = z.object({
  id: z.enum(["foo", "bar"]),
})

type Body = z.infer<typeof BodySchema>

export const options: RouteOptions = {
  method: "POST",
  url: "/",
  schema: {
    body: BodySchema,
  },
  preHandler: [requireAuth],
  handler: async ({ body }: FastifyRequest<{ Body: Body }>, rep) => {
    return rep.code(200).send({
      foo: body.id,
    })
  },
}

export default route()({
  method: "POST",
  url: "/",
  schema: {
    querystring: z.object({
      name: z.string().min(4),
    }),
    body: z.object({
      id: z.enum(["foo", "bar"]),
      data: z.union([
        z.object({
          test: z.enum(["test"]),
          bar: z.enum(["vlad"]),
        }),
        z.object({
          test: z.enum(["bar"]),
          bar: z.enum(["jorge"]),
        }),
      ]),
    }),
  },
  // preHandler: [requireAuth],
  handler: async ({ body, query }, rep) => {
    if (body.data.test === "test") {
      body.data.bar
    } else {
      body.data.bar
    }

    // query.name
    return rep.code(200).send({
      foo: body.id,
    })
  },
})

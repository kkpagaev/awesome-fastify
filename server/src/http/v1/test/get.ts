import { z } from "zod"

export default createRoute({
  method: "GET",
  url: "/",
  query: z.object({
    id: z.string(),
  }),
  handler: async (_req, rep) => {
    return rep.code(200).send({
      foo: "bar",
    })
  },
})

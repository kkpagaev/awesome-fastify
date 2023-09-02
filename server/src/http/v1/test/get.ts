import { Role } from "@prisma/client"
import { z } from "zod"

export default createRoute({
  query: z.object({
    id: z.string(),
  }),
  roles: [Role.Admin],
  handler: async (_req, rep) => {
    return rep.code(200).send({
      foo: "bar",
    })
  },
})

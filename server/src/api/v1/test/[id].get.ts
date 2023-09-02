import { z } from "zod"

export default createRoute({
  params: z.object({
    id: z.coerce.number(),
  }),
  async handler({ params }, rep) {
    return rep.code(200).send({
      id: params.id,
    })
  },
})

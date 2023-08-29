import { z } from "zod"

export default createRoute({
  body: z.object({
    id: z.enum(["foo", "bar"]),
  }),
  method: "POST",
  handler() {
    return {
      hello: "world",
    }
  },
})

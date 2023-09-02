import { z } from "zod"
import * as bcrypt from "bcrypt"
import { ConflictException } from "../../../exceptions"
import { userEmailExists } from "../../../services/user/repository"

export default createRoute({
  guard: [
    {
      if: ({ body }) => userEmailExists(body.email),
      throw: new ConflictException("User email already exists"),
    },
  ],
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  handler: async ({ body }, rep) =>
    rep.code(201).send({
      user: await prisma.user.create({
        data: {
          email: body.email,
          password: await bcrypt.hash(body.password, 10),
        },
      }),
    }),
})

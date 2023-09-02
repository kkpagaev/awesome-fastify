import { z } from "zod"
import * as bcrypt from "bcrypt"
import { userEmailExists } from "../../../services/user/repository"
import {
  ConflictException,
  UnprocessableEntityException,
} from "../../exceptions"

export default createRoute({
  guard: [
    {
      unless: ({ body }) => body.password === body.passwordConfirm,
      throw: new UnprocessableEntityException(
        "password and passwordConfirm must match"
      ),
    },
    {
      if: ({ body }) => userEmailExists(body.email),
      throw: new ConflictException("User email already exists"),
    },
  ],
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
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

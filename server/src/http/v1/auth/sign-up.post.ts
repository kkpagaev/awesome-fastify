import { z } from "zod"
import { PASSWORD_MIN_LENGTH } from "../../../const"
import * as bcrypt from "bcrypt"
import {
  userEmailExists,
  userNicknameExists,
} from "../../../services/user/repository"
import { ConflictException } from "../../exceptions"

export default createRoute({
  guard: [
    {
      if: ({ body }) => userEmailExists(body.email),
      throw: new ConflictException("User email already exists"),
    },
    {
      if: ({ body }) => userNicknameExists(body.username),
      throw: new ConflictException("User username already exists"),
    },
  ],
  body: z.object({
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    username: z.string().min(2),
  }),
  async handler({ body }, rep) {
    const passwordHash = await bcrypt.hash(body.password, 10)

    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: passwordHash,
      },
    })

    return rep.code(201).send({
      user,
    })
  },
})

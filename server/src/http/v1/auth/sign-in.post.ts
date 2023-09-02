import { createJwt } from "../../../services/auth/jwt"
import { findUserByEmail } from "../../../services/user/repository"
import * as bcrypt from "bcrypt"
import { z } from "zod"
import { UnauthorizedException } from "../../exceptions"

export default createRoute({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(2),
  }),
  handler: async ({ body: { email, password } }, rep) => {
    const user = await findUserByEmail(email)

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException()
    }

    return rep.code(201).send({
      accessToken: createJwt({
        userId: user.id,
      }),
    })
  },
})

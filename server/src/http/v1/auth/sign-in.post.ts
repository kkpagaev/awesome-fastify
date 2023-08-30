import { createJwt } from "../../../services/auth/jwt"
import { findUserByEmail } from "../../../services/user/repository"
import * as bcrypt from "bcrypt"
import { z } from "zod"
import { UnauthorizedException } from "../../exceptions"

export default createRoute({
  method: "POST",
  url: "/sign-in",
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(2),
  }),
  handler: async ({ body }, rep) => {
    const { email, password } = body

    const user = await findUserByEmail(email)

    if (!user) {
      throw new UnauthorizedException()
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException()
    }

    const accessToken = createJwt({
      userId: user.id,
    })

    return rep.code(201).send({
      accessToken,
    })
  },
})

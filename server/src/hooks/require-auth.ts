import { onRequestHookHandler } from "fastify"
import { UnauthorizedException } from "../exceptions/unauthorized.exception"
import { verifyJwt } from "../services/auth/jwt"

export class JwtError extends Error {
  constructor() {
    super("Invalid JWT")
  }
}
export const requireAuth: onRequestHookHandler = async (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException()
  }
  const token = authHeader.substring("Bearer ".length)
  const payload = verifyJwt(token)

  if (!payload) {
    throw new UnauthorizedException()
  }

  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
    },
  })

  if (!user) {
    throw new UnauthorizedException()
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  req.user = user
}

import { onRequestHookHandler } from "fastify"
import { UnauthorizedException } from "../exceptions"
import { Role, User } from "@prisma/client"

export const requireRoles: (roles: Role[]) => onRequestHookHandler = (
  roles
) => {
  return async (req) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user: User = req.user

    if (!roles.includes(user.role)) {
      throw new UnauthorizedException()
    }
  }
}

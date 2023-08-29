import * as jwt from "jsonwebtoken"

export interface JwtPayload {
  userId: string
}

export const createJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" })
}

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

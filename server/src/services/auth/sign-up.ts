import { User } from "@prisma/client"
import { ConflictException } from "../../http/exceptions/conflict-exception"
import { userEmailExists, userNicknameExists } from "../user/repository"
import { prisma } from "../../prisma"
import * as bcrypt from "bcrypt"

export const signUp = async (dto: SignUp): Promise<User> => {}

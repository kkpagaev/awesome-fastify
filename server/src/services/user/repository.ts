export const userEmailExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  return Boolean(user)
}

export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  return user
}

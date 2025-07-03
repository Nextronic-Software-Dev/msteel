const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('20242024', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'admin3@gmail.com',
      name: 'admin',
      password: hashedPassword,
    },
  })
  
  console.log('Utilisateur créé:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
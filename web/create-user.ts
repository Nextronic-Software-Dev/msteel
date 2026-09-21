import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const name = "maghrebsteel";
  const email = "msteel@gmail.com";
  const password = "20262026";

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("❌ Un utilisateur avec cet email existe déjà.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  console.log("✅ Utilisateur créé avec succès :");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}

main()
  .catch((error) => {
    console.error("❌ Erreur :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
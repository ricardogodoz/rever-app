import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const requiredEnv = ["DATABASE_URL", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  const admin = await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {
      name: process.env.ADMIN_NAME!,
      passwordHash,
    },
    create: {
      name: process.env.ADMIN_NAME!,
      email: process.env.ADMIN_EMAIL!,
      passwordHash,
    },
  });

  console.log(`Administrador pronto: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });

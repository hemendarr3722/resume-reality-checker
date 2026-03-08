import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const password = "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Demo User" },
  });

  await prisma.project.create({
    data: {
      userId: user.id,
      title: "Senior Data Engineer - ExampleCo",
      companyName: "ExampleCo",
      roleTitle: "Senior Data Engineer",
      jdText: "We are looking for a Senior Data Engineer with Python, SQL, Spark, Airflow, AWS, and data modeling experience. Nice to have: dbt, Kafka, and observability.",
    },
  });

  console.log("Seeded. Demo login:", email, password);
}

main().finally(async () => prisma.$disconnect());

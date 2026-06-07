import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * 演示账号：家长 + 孩子，同一家庭
 */
async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const parent = await prisma.user.upsert({
    where: { email: "parent@demo.local" },
    update: { role: UserRole.SUPER_ADMIN },
    create: {
      email: "parent@demo.local",
      passwordHash,
      displayName: "爸爸",
      role: UserRole.ADMIN,
    },
  });

  const child = await prisma.user.upsert({
    where: { email: "child@demo.local" },
    update: { role: UserRole.EXECUTOR },
    create: {
      email: "child@demo.local",
      passwordHash,
      displayName: "小明",
      role: UserRole.EXECUTOR,
    },
  });

  let team = await prisma.team.findFirst({
    where: { ownerId: parent.id },
  });

  if (!team) {
    team = await prisma.team.create({
      data: {
        name: "演示家庭",
        ownerId: parent.id,
        members: { connect: [{ id: parent.id }, { id: child.id }] },
      },
    });
  }

  await prisma.user.update({
    where: { id: parent.id },
    data: { teamId: team.id, role: UserRole.SUPER_ADMIN },
  });
  await prisma.user.update({
    where: { id: child.id },
    data: { teamId: team.id, role: UserRole.EXECUTOR },
  });

  console.log("Seed 完成：parent@demo.local / child@demo.local 密码 demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

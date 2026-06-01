import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * 演示账号：家长 + 孩子，同一团队
 */
async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const parent = await prisma.user.upsert({
    where: { email: "parent@demo.local" },
    update: {},
    create: {
      email: "parent@demo.local",
      passwordHash,
      displayName: "爸爸",
    },
  });

  const child = await prisma.user.upsert({
    where: { email: "child@demo.local" },
    update: {},
    create: {
      email: "child@demo.local",
      passwordHash,
      displayName: "小明",
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
    await prisma.user.updateMany({
      where: { id: { in: [parent.id, child.id] } },
      data: { teamId: team.id },
    });
  }

  console.log("Seed 完成：parent@demo.local / child@demo.local 密码 demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

import { InvitationStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { zh } from "@/lib/messages/zh";

const memberSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  points: true,
} as const;

/**
 * 是否为仅含创建者一人的空家庭（可放弃并加入其他家庭）
 * @param userId - 用户 ID
 * @param teamId - 团队 ID
 */
async function isAbandonableSoloTeam(
  userId: string,
  teamId: string
): Promise<boolean> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: { select: { id: true } } },
  });
  if (!team || team.ownerId !== userId) return false;
  return team.members.length === 1 && team.members[0].id === userId;
}

/**
 * 解散仅含本人的空家庭，便于接受其他家庭邀请
 * @param userId - 用户 ID
 * @param teamId - 待解散团队 ID
 */
async function abandonSoloTeam(userId: string, teamId: string) {
  const canAbandon = await isAbandonableSoloTeam(userId, teamId);
  if (!canAbandon) {
    throw new Error(zh.team.alreadyInTeam);
  }
  await prisma.$transaction([
    prisma.teamInvitation.deleteMany({ where: { teamId } }),
    prisma.user.update({ where: { id: userId }, data: { teamId: null } }),
    prisma.team.delete({ where: { id: teamId } }),
  ]);
}

/**
 * 获取用户团队详情
 * @param userId - 当前用户 ID
 */
export async function getTeamForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { team: true },
  });
  if (!user?.team) return null;

  const members = await prisma.user.findMany({
    where: { teamId: user.team.id },
    select: memberSelect,
    orderBy: [{ createdAt: "asc" }],
  });

  return {
    id: user.team.id,
    name: user.team.name,
    members,
  };
}

/**
 * 创建团队并将创建者加入
 * @param userId - 创建者 ID
 * @param name - 团队名称
 */
export async function createTeam(userId: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing?.teamId) {
    throw new Error(zh.team.alreadyInTeam);
  }
  const team = await prisma.team.create({
    data: {
      name: name?.trim() || "我的家庭",
      ownerId: userId,
      members: { connect: { id: userId } },
    },
    include: {
      members: { select: memberSelect },
    },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { teamId: team.id, role: UserRole.SUPER_ADMIN },
  });
  return { id: team.id, name: team.name, members: team.members };
}

/**
 * 发出团队邀请
 */
export async function sendInvitation(
  inviterId: string,
  inviteeEmail: string
) {
  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    include: { team: true },
  });
  if (!inviter?.teamId || !inviter.team) {
    throw new Error(zh.team.noTeam);
  }
  const normalized = inviteeEmail.trim().toLowerCase();
  if (normalized === inviter.email.toLowerCase()) {
    throw new Error(zh.team.cannotInviteSelf);
  }
  const invitee = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (!invitee) {
    throw new Error(zh.team.userNotFound);
  }
  if (invitee.teamId === inviter.teamId) {
    throw new Error(zh.team.alreadyMember);
  }
  if (invitee.teamId) {
    const canLeaveSolo = await isAbandonableSoloTeam(
      invitee.id,
      invitee.teamId
    );
    if (!canLeaveSolo) {
      throw new Error(zh.team.alreadyInOtherTeam);
    }
  }
  const pending = await prisma.teamInvitation.findFirst({
    where: {
      teamId: inviter.teamId,
      inviteeEmail: normalized,
      status: InvitationStatus.PENDING,
    },
  });
  if (pending) {
    return formatInvitation(pending, inviter.team.name, inviter.displayName);
  }
  const invitation = await prisma.teamInvitation.create({
    data: {
      teamId: inviter.teamId,
      inviterId,
      inviteeEmail: normalized,
      inviteeId: invitee.id,
    },
  });
  return formatInvitation(invitation, inviter.team.name, inviter.displayName);
}

/**
 * 被邀请方待处理列表
 */
export async function listPendingInvitationsForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];
  const invitations = await prisma.teamInvitation.findMany({
    where: {
      inviteeEmail: user.email.toLowerCase(),
      status: InvitationStatus.PENDING,
    },
    include: {
      team: true,
      inviter: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return invitations.map((inv) =>
    formatInvitation(inv, inv.team.name, inv.inviter.displayName)
  );
}

/**
 * 接受或拒绝邀请
 */
export async function respondToInvitation(
  userId: string,
  invitationId: string,
  action: "accept" | "reject"
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(zh.errors.unauthorized);
  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
    include: { team: true },
  });
  if (
    !invitation ||
    invitation.inviteeEmail !== user.email.toLowerCase() ||
    invitation.status !== InvitationStatus.PENDING
  ) {
    throw new Error(zh.team.inviteNotFound);
  }
  if (action === "reject") {
    const updated = await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REJECTED, respondedAt: new Date() },
      include: { team: true, inviter: { select: { displayName: true } } },
    });
    return formatInvitation(
      updated,
      updated.team.name,
      updated.inviter.displayName
    );
  }
  if (user.teamId === invitation.teamId) {
    throw new Error(zh.team.alreadyMember);
  }
  if (user.teamId) {
    await abandonSoloTeam(user.id, user.teamId);
  }
  await prisma.$transaction([
    prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: InvitationStatus.ACCEPTED,
        respondedAt: new Date(),
        inviteeId: user.id,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { teamId: invitation.teamId },
    }),
  ]);
  const updated = await prisma.teamInvitation.findUniqueOrThrow({
    where: { id: invitationId },
    include: { team: true, inviter: { select: { displayName: true } } },
  });
  return formatInvitation(
    updated,
    updated.team.name,
    updated.inviter.displayName
  );
}

function formatInvitation(
  inv: {
    id: string;
    inviteeEmail: string;
    status: InvitationStatus;
  },
  teamName: string,
  inviterName: string
) {
  return {
    id: inv.id,
    teamName,
    inviterName,
    inviteeEmail: inv.inviteeEmail,
    status: inv.status,
  };
}

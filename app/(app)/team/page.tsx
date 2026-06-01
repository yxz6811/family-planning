import { TeamPanel } from "@/components/team-panel";
import { requireUser } from "@/lib/auth/session";
import {
  getTeamForUser,
  listPendingInvitationsForUser,
} from "@/lib/services/team-service";

export default async function TeamPage() {
  const user = await requireUser();
  const [team, pendingInvites] = await Promise.all([
    getTeamForUser(user.id),
    listPendingInvitationsForUser(user.id),
  ]);
  return <TeamPanel team={team} pendingInvites={pendingInvites} />;
}

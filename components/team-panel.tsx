"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { withBasePath } from "@/lib/base-path";
import { roleLabel, zh } from "@/lib/messages/zh";

interface Member {
  id: string;
  email: string;
  displayName: string;
  role?: string;
  points?: number;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

interface Invitation {
  id: string;
  teamName: string;
  inviterName: string;
  inviteeEmail: string;
  status: string;
}

interface TeamPanelProps {
  team: Team | null;
  pendingInvites: Invitation[];
}

/**
 * 团队创建、邀请与接受
 */
export function TeamPanel({ team, pendingInvites }: TeamPanelProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("我的家庭");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createTeam() {
    setError("");
    const res = await fetch(withBasePath("/api/team"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? zh.errors.badRequest);
      return;
    }
    setMessage("团队已创建");
    router.refresh();
  }

  async function sendInvite() {
    setError("");
    const res = await fetch(withBasePath("/api/team/invitations"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteeEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? zh.errors.badRequest);
      return;
    }
    setMessage("邀请已发送");
    setInviteeEmail("");
    router.refresh();
  }

  async function respondInvite(id: string, action: "accept" | "reject") {
    setError("");
    const res = await fetch(withBasePath(`/api/team/invitations/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? zh.errors.badRequest);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader title={zh.team.pendingInvites} />
          <ul className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <span className="text-sm">
                  {inv.inviterName} 邀请你加入「{inv.teamName}」
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respondInvite(inv.id, "accept")}>
                    {zh.team.accept}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => respondInvite(inv.id, "reject")}
                  >
                    {zh.team.reject}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!team ? (
        <Card>
          <CardHeader
            title={zh.team.create}
            description={zh.team.noTeam}
          />
          <Field label={zh.team.teamName}>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </Field>
          <Button
            className="mt-4 inline-flex gap-2"
            onClick={createTeam}
          >
            <Users className="h-4 w-4" aria-hidden />
            {zh.team.create}
          </Button>
        </Card>
      ) : (
        <Card>
          <CardHeader title={team.name} description={zh.team.members} />
          <ul className="mb-6 flex flex-col gap-2">
            {team.members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg)] px-4 py-3 text-sm"
              >
                <span className="font-medium">{m.displayName}</span>
                <Badge variant="muted">
                  {roleLabel(m.role ?? "EXECUTOR")} · {m.points ?? 0}{" "}
                  {zh.nav.points}
                </Badge>
              </li>
            ))}
          </ul>
          <h3 className="mb-3 flex items-center gap-2 font-medium">
            <UserPlus className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
            {zh.team.invite}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              placeholder={zh.team.inviteeEmail}
              className="min-w-[200px] flex-1"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
            />
            <Button className="inline-flex gap-2" onClick={sendInvite}>
              <Mail className="h-4 w-4" aria-hidden />
              {zh.team.sendInvite}
            </Button>
          </div>
        </Card>
      )}

      {message && (
        <p className="rounded-[var(--radius-sm)] bg-[var(--color-success-soft)] px-3 py-2 text-sm text-[var(--color-success)]">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

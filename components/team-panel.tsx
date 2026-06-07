"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
        <section className="rounded-xl bg-[var(--color-surface)] p-6">
          <h2 className="mb-3 font-semibold">{zh.team.pendingInvites}</h2>
          <ul className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] p-3"
              >
                <span className="text-sm">
                  {inv.inviterName} 邀请你加入「{inv.teamName}」
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => respondInvite(inv.id, "accept")}
                    className="rounded-md bg-[var(--color-primary)] px-3 py-1 text-sm text-white"
                  >
                    {zh.team.accept}
                  </button>
                  <button
                    type="button"
                    onClick={() => respondInvite(inv.id, "reject")}
                    className="rounded-md border border-[var(--color-border)] px-3 py-1 text-sm"
                  >
                    {zh.team.reject}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!team ? (
        <section className="rounded-xl bg-[var(--color-surface)] p-6">
          <h2 className="mb-3 font-semibold">{zh.team.create}</h2>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            {zh.team.noTeam}
          </p>
          <label className="mb-3 flex flex-col gap-1 text-sm">
            {zh.team.teamName}
            <input
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={createTeam}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-white"
          >
            {zh.team.create}
          </button>
        </section>
      ) : (
        <section className="rounded-xl bg-[var(--color-surface)] p-6">
          <h2 className="mb-1 text-xl font-semibold">{team.name}</h2>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            {zh.team.members}
          </p>
          <ul className="mb-6 flex flex-col gap-2">
            {team.members.map((m) => (
              <li
                key={m.id}
                className="rounded-md bg-[var(--color-bg)] px-3 py-2 text-sm"
              >
                {m.displayName}{" "}
                <span className="text-[var(--color-muted)]">
                  ({roleLabel(m.role ?? "EXECUTOR")} · {m.points ?? 0}{" "}
                  {zh.nav.points})
                </span>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 font-medium">{zh.team.invite}</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              placeholder={zh.team.inviteeEmail}
              className="min-w-[200px] flex-1 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={sendInvite}
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white"
            >
              {zh.team.sendInvite}
            </button>
          </div>
        </section>
      )}

      {message && (
        <p className="text-sm text-[var(--color-success)]">{message}</p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

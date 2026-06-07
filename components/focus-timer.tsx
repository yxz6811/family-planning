"use client";

import { useEffect, useState } from "react";
import { zh } from "@/lib/messages/zh";

interface FocusTimerProps {
  durationMinutes: number;
}

/**
 * 专注番茄钟（PRD 5.2 沉浸专注模式简化版）
 */
export function FocusTimer({ durationMinutes }: FocusTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    setRemaining(durationMinutes * 60);
    setRunning(false);
  }, [durationMinutes]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const done = remaining === 0;

  return (
    <div className="mt-3 rounded-md bg-[var(--color-bg)] px-3 py-2">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[var(--color-muted)]">专注计时</span>
        <span className="font-mono text-lg tabular-nums text-[var(--color-primary)]">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
      <div className="flex gap-2">
        {!done && (
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-surface)]"
          >
            {running ? zh.taskBoard.focusPause : zh.taskBoard.focusStart}
          </button>
        )}
        {done && (
          <span className="text-xs text-[var(--color-success)]">
            {zh.taskBoard.focusDone}
          </span>
        )}
      </div>
    </div>
  );
}

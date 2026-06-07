"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-[var(--color-muted)]">
          <Timer className="h-4 w-4" aria-hidden />
          专注计时
        </span>
        <span className="font-mono text-lg tabular-nums text-[var(--color-primary)]">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
      <div
        className="mb-3 h-1.5 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-surface)]"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-[var(--radius-full)] bg-[var(--color-primary)] transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-2">
        {!done && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRunning((r) => !r)}
          >
            {running ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden />
                {zh.taskBoard.focusPause}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden />
                {zh.taskBoard.focusStart}
              </>
            )}
          </Button>
        )}
        {done && (
          <span className="text-sm text-[var(--color-success)]">
            {zh.taskBoard.focusDone}
          </span>
        )}
      </div>
    </div>
  );
}

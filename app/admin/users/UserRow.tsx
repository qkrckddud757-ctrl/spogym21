"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  rank: string | null;
  team: string | null;
};

const RANK_OPTIONS: { value: string; label: string }[] = [
  { value: "staff", label: "사원" },
  { value: "senior", label: "주임" },
  { value: "leader", label: "팀장" },
  { value: "manager", label: "매니저" },
];

export function UserRow({
  profile,
  isSelf,
}: {
  profile: Profile;
  isSelf: boolean;
}) {
  const [rank, setRank] = useState(profile.rank ?? "staff");
  const [team, setTeam] = useState(profile.team ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { kind: "ok" } | { kind: "error"; msg: string } | null
  >(null);

  const isDirty =
    rank !== (profile.rank ?? "staff") ||
    team.trim() !== (profile.team ?? "");

  function onSave() {
    startTransition(async () => {
      const result = await updateProfile({
        id: profile.id,
        rank,
        team: team.trim() || null,
      });
      if (result.ok) {
        setFeedback({ kind: "ok" });
        setTimeout(() => setFeedback(null), 2000);
      } else {
        setFeedback({ kind: "error", msg: result.error });
      }
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="px-4 py-3 text-sm">
        <div className="font-medium">{profile.name ?? "(이름 없음)"}</div>
        <div className="text-xs text-slate-500">{profile.email ?? "-"}</div>
        {isSelf && (
          <span className="mt-1 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            본인
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          disabled={isPending}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {RANK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="예: A"
          disabled={isPending}
          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onSave}
          disabled={!isDirty || isPending}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
        >
          {isPending ? "저장 중..." : feedback?.kind === "ok" ? "저장됨" : "저장"}
        </button>
        {feedback?.kind === "error" && (
          <p className="mt-1 text-xs text-rose-600">{feedback.msg}</p>
        )}
      </td>
    </tr>
  );
}

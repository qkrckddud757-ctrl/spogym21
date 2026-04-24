import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTrial, deleteTrial } from "../actions";
import { AIStrategyPanel } from "./AIStrategyPanel";
import { UpdateTrialForm } from "./UpdateTrialForm";

// datetime-local 입력 포맷 (YYYY-MM-DDTHH:MM)
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trial } = await supabase
    .from("ot_trials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!trial) notFound();

  const updateAction = updateTrial.bind(null, trial.id);
  const deleteAction = deleteTrial.bind(null, trial.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/trials"
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← 목록
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">{trial.name}</h1>
          </div>
          <form action={deleteAction}>
            <button
              type="submit"
              className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
            >
              삭제
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        <AIStrategyPanel
          trialId={trial.id}
          initialStrategy={trial.ai_strategy}
          initialAt={trial.ai_strategy_at}
        />

        <UpdateTrialForm
          action={updateAction}
          initial={{
            name: trial.name,
            kind: trial.kind ?? "trial",
            gender: trial.gender ?? "",
            age: trial.age ?? undefined,
            phone: trial.phone ?? "",
            scheduled_at: toLocalInput(trial.scheduled_at),
            attended_at: toLocalInput(trial.attended_at),
            status: trial.status ?? "계획",
            goal: trial.goal ?? "",
            concerns: trial.concerns ?? "",
            discussed: trial.discussed ?? "",
            followup_notes: trial.followup_notes ?? "",
          }}
        />
      </main>
    </div>
  );
}

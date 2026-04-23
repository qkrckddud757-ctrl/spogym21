import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTrial } from "../actions";
import { TrialForm } from "../TrialForm";

export default async function NewTrialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link
            href="/trials"
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ← OT·체험 명단
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">체험 등록</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <form action={createTrial} className="space-y-6">
          <TrialForm />
          <div className="flex justify-end gap-3">
            <Link
              href="/trials"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              취소
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              저장
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

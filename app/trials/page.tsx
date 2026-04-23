import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLE: Record<string, string> = {
  예정: "bg-sky-100 text-sky-700",
  완료: "bg-slate-100 text-slate-700",
  등록: "bg-emerald-100 text-emerald-700",
  놓침: "bg-rose-100 text-rose-700",
};

export default async function TrialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trials, error } = await supabase
    .from("ot_trials")
    .select("id, name, gender, age, scheduled_at, attended_at, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← 대시보드
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">OT · 체험 명단</h1>
          </div>
          <Link
            href="/trials/new"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            + 체험 등록
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            조회 실패: {error.message}
          </div>
        ) : !trials || trials.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            등록된 OT·체험이 없어요.
            <br />
            <Link
              href="/trials/new"
              className="mt-3 inline-block text-slate-900 underline dark:text-slate-100"
            >
              첫 체험을 등록해주세요
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trials.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/trials/${t.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">{t.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {t.gender ?? "-"} {t.age ? `· ${t.age}세` : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLE[t.status ?? ""] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.status ?? "-"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-0.5 text-xs text-slate-500">
                    {t.scheduled_at && (
                      <p>예정: {new Date(t.scheduled_at).toLocaleString("ko-KR")}</p>
                    )}
                    {t.attended_at && (
                      <p>참석: {new Date(t.attended_at).toLocaleString("ko-KR")}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

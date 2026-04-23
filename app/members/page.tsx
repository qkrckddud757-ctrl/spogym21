// /members — 내가 담당하는 PT 회원 목록 (매니저는 전 회원)
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLE: Record<string, string> = {
  활발: "bg-emerald-100 text-emerald-700",
  관심필요: "bg-rose-100 text-rose-700",
  재등록임박: "bg-amber-100 text-amber-700",
  중단: "bg-slate-200 text-slate-700",
};

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: members, error } = await supabase
    .from("pt_members")
    .select(
      "id, name, gender, age, sessions_total, sessions_used, status, updated_at",
    )
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
            <h1 className="text-xl font-semibold tracking-tight">내 PT 회원</h1>
          </div>
          <Link
            href="/members/new"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            + 회원 추가
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            조회 실패: {error.message}
          </div>
        ) : !members || members.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            아직 등록된 회원이 없어요.
            <br />
            <Link
              href="/members/new"
              className="mt-3 inline-block text-slate-900 underline dark:text-slate-100"
            >
              첫 회원을 추가해주세요
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/members/${m.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">{m.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {m.gender ?? "-"} {m.age ? `· ${m.age}세` : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLE[m.status ?? ""] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {m.status ?? "-"}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    세션 {m.sessions_used ?? 0} / {m.sessions_total ?? 0}
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

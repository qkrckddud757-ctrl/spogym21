// /admin/users — 매니저가 팀원 직급·팀을 UI로 변경
// 접근 권한: rank = 'manager' 만. 그 외는 /dashboard 로 리다이렉트.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRow } from "./UserRow";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("rank")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.rank !== "manager") {
    redirect("/dashboard");
  }

  // 매니저는 RLS 상 전 프로필 조회 가능
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, name, rank, team, created_at")
    .order("created_at", { ascending: true });

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
            <h1 className="text-xl font-semibold tracking-tight">
              유저 관리
            </h1>
          </div>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            매니저 전용
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            팀원의 직급과 팀을 변경할 수 있어요. 직급은 "자기 직급 이하만 보이는"
            권한 규칙의 기준입니다.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            프로필 조회 실패: {error.message}
          </div>
        ) : !profiles || profiles.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            아직 등록된 사용자가 없습니다. 첫 로그인을 해야 프로필이 생깁니다.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">이름 / 이메일</th>
                  <th className="px-4 py-3 font-medium">직급</th>
                  <th className="px-4 py-3 font-medium">팀</th>
                  <th className="px-4 py-3 text-right font-medium">저장</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <UserRow
                    key={p.id}
                    profile={p}
                    isSelf={p.id === user.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400">
          ※ 직급별 조회 권한: 매니저는 전부 / 팀장은 매니저 제외 / 주임은 팀장·매니저
          제외 / 사원은 사원끼리만. 팀 값은 "A"·"B" 같은 짧은 식별자 추천.
        </p>
      </main>
    </div>
  );
}

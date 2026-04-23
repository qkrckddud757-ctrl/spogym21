// FitConsult — 대시보드
// 헤더(이름·직급·팀)는 Supabase profiles 테이블의 실데이터,
// 오늘 할 일 / PT 회원 / 주간 지표는 아직 목업. 5~6단계에서 실데이터로 교체.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const RANK_LABEL: Record<string, string> = {
  manager: "매니저",
  leader: "팀장",
  senior: "주임",
  staff: "사원",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // profiles 테이블에서 본인 행 조회 (트리거로 자동 생성됨)
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, rank, team")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.name ?? user.email?.split("@")[0] ?? "사용자";
  const rankKey = profile?.rank ?? "staff";
  const rankLabel = RANK_LABEL[rankKey] ?? rankKey;
  const teamLabel = profile?.team ?? "미배정";

  // ------ 아래부터는 아직 목업 ------
  const todos = [
    { id: 1, text: "박○○ 회원 재등록 멘트 보내기", type: "재등록" },
    { id: 2, text: "이○○ OT 후속 전화", type: "OT" },
    { id: 3, text: "최○○ 미방문 리콜백", type: "리콜백" },
    { id: 4, text: "정○○ 체험 수업 후 등록 유도", type: "체험" },
    { id: 5, text: "강○○ 재등록 명분 세팅", type: "재등록" },
  ];
  const members = [
    { id: 1, name: "박○○", sessionsLeft: 3, status: "재등록 임박", nextSession: "오늘 15:00" },
    { id: 2, name: "김○○", sessionsLeft: 12, status: "활발", nextSession: "내일 10:00" },
    { id: 3, name: "이○○", sessionsLeft: 1, status: "관심 필요", nextSession: "수요일 18:00" },
    { id: 4, name: "최○○", sessionsLeft: 8, status: "활발", nextSession: "목요일 14:00" },
  ];
  const metrics = [
    { label: "OT → 등록률", value: "68%", change: "+4%p", positive: true },
    { label: "체험 → 등록률", value: "42%", change: "-2%p", positive: false },
    { label: "재등록률", value: "81%", change: "+1%p", positive: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">FitConsult</h1>
          <div className="flex items-center gap-3 text-sm">
            {rankKey === "manager" && (
              <Link
                href="/admin/users"
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                유저 관리
              </Link>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {teamLabel === "미배정" ? "팀 미배정" : `${teamLabel}팀`} · {rankLabel}
            </span>
            <span className="font-medium">{displayName}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            {new Intl.DateTimeFormat("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            }).format(new Date())}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            안녕하세요, {displayName}님
          </h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            오늘 처리할 일 {todos.length}개가 준비되어 있어요.
          </p>
          {rankKey === "staff" && teamLabel === "미배정" && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              ※ 아직 팀·직급이 배정되지 않았어요. 매니저가 관리 페이지에서 권한을
              부여해주거나, 본인이 매니저라면 Supabase SQL 에서 직접 설정해주세요.
            </p>
          )}
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm text-slate-500">{m.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-semibold">{m.value}</p>
                <p className={m.positive ? "text-sm text-emerald-600" : "text-sm text-rose-600"}>
                  {m.change}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">오늘 할 일</h3>
            <ul className="space-y-3">
              {todos.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                >
                  <span className="mt-0.5 inline-block h-4 w-4 rounded border border-slate-300 dark:border-slate-600" />
                  <div className="flex-1">
                    <p className="text-sm">{t.text}</p>
                    <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {t.type}
                    </span>
                  </div>
                  <button className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    AI 멘트
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">내 PT 회원</h3>
            <ul className="space-y-3">
              {members.map((m) => {
                const statusClass =
                  m.status === "재등록 임박"
                    ? "bg-amber-100 text-amber-700"
                    : m.status === "관심 필요"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700";
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        남은 세션 {m.sessionsLeft}회 · {m.nextSession}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
                      {m.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          ※ 헤더(이름·직급·팀)는 실제 Supabase 데이터. 오늘 할 일·PT 회원·지표는 아직 목업 (5~6단계에서 실데이터로 교체).
        </p>
      </main>
    </div>
  );
}

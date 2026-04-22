import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <main className="flex w-full max-w-xl flex-col items-center gap-8 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">FitConsult</h1>
          <p className="mt-2 text-sm text-slate-500">
            헬스장 PT 부서 1:1 컨설팅 시스템
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-300">
          로그인·DB 연결 전의 기본 대시보드 미리보기입니다.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          대시보드 열기
        </Link>

        <p className="text-xs text-slate-400">
          1단계: Next.js 최소 버전 · 2단계부터 Supabase + 구글 로그인 + Gemini
        </p>
      </main>
    </div>
  );
}

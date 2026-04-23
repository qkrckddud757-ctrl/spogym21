"use client";

import { useState } from "react";

type Props = {
  trialId: string;
  initialStrategy: string | null;
  initialAt: string | null;
};

export function AIStrategyPanel({ trialId, initialStrategy, initialAt }: Props) {
  const [strategy, setStrategy] = useState(initialStrategy ?? "");
  const [at, setAt] = useState(initialAt ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/ot-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trialId }),
      });
      const data = (await res.json()) as {
        strategy?: string;
        generatedAt?: string;
        error?: string;
      };
      if (!res.ok || data.error) {
        setError(data.error ?? "AI 호출 실패");
      } else {
        setStrategy(data.strategy ?? "");
        setAt(data.generatedAt ?? new Date().toISOString());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI 전환 전략 (체험 → 등록)</h3>
          {at && (
            <p className="mt-1 text-xs text-slate-500">
              마지막 생성: {new Date(at).toLocaleString("ko-KR")}
            </p>
          )}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? "생성 중..." : strategy ? "새로 생성" : "AI 전략 생성"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </p>
      )}

      {strategy ? (
        <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:prose-invert dark:bg-slate-950 dark:text-slate-200">
          {strategy}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          체험 정보·상담 내용·후속 메모를 충실히 저장한 뒤 "AI 전략 생성"을 누르세요.
        </p>
      )}
    </section>
  );
}

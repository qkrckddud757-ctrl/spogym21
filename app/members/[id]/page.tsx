import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberForm } from "../MemberForm";
import { updateMember, deleteMember } from "../actions";
import { AIStrategyPanel } from "./AIStrategyPanel";

export default async function MemberDetailPage({
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

  const { data: member } = await supabase
    .from("pt_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  const updateAction = updateMember.bind(null, member.id);
  const deleteAction = deleteMember.bind(null, member.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/members"
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← 목록
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">
              {member.name}
            </h1>
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
          memberId={member.id}
          initialStrategy={member.ai_strategy}
          initialAt={member.ai_strategy_at}
        />

        <form action={updateAction} className="space-y-6">
          <MemberForm
            initial={{
              name: member.name,
              gender: member.gender ?? "",
              age: member.age ?? undefined,
              phone: member.phone ?? "",
              goal: member.goal ?? "",
              health_notes: member.health_notes ?? "",
              motivation: member.motivation ?? "",
              sessions_total: member.sessions_total ?? 0,
              sessions_used: member.sessions_used ?? 0,
              status: member.status ?? "활발",
              notes: member.notes ?? "",
            }}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              정보 저장
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

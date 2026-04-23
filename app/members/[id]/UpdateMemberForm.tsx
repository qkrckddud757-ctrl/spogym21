"use client";

import { useActionState } from "react";
import type { ComponentProps } from "react";
import { MemberForm } from "../MemberForm";
import type { UpdateState } from "../actions";

type Props = {
  action: (prev: UpdateState, formData: FormData) => Promise<UpdateState>;
  initial: ComponentProps<typeof MemberForm>["initial"];
};

export function UpdateMemberForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState<UpdateState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <MemberForm initial={initial} />
      <div className="flex items-center justify-end gap-3">
        {state?.ok && state.at && (
          <p className="text-sm text-emerald-600">
            저장됨 ({new Date(state.at).toLocaleTimeString("ko-KR")})
          </p>
        )}
        {state && state.ok === false && (
          <p className="text-sm text-rose-600">실패: {state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {pending ? "저장 중..." : "정보 저장"}
        </button>
      </div>
    </form>
  );
}

type InitialValues = Partial<{
  name: string;
  kind: string; // 'ot' | 'trial'
  gender: string;
  age: number;
  phone: string;
  scheduled_at: string; // datetime-local input 용 (YYYY-MM-DDTHH:MM)
  attended_at: string;
  status: string;
  goal: string;
  concerns: string;
  discussed: string;
  followup_notes: string;
}>;

const STATUS_LIST = ["계획", "예상", "확정", "등록", "미등록", "보류"];
const KIND_OPTIONS = [
  { value: "trial", label: "체험 수업 (등록 전)" },
  { value: "ot", label: "OT (등록 후 첫 수업)" },
];

export function TrialForm({ initial = {} }: { initial?: InitialValues }) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Field label="종류" required>
        <select
          name="kind"
          defaultValue={initial.kind ?? "trial"}
          required
          className={inputCls}
        >
          {KIND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="이름" required>
          <input
            name="name"
            defaultValue={initial.name ?? ""}
            required
            className={inputCls}
          />
        </Field>
        <Field label="성별">
          <select
            name="gender"
            defaultValue={initial.gender ?? ""}
            className={inputCls}
          >
            <option value="">선택</option>
            <option value="남">남</option>
            <option value="여">여</option>
          </select>
        </Field>
        <Field label="나이">
          <input
            name="age"
            type="number"
            min={10}
            max={100}
            defaultValue={initial.age ?? ""}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="연락처">
        <input
          name="phone"
          defaultValue={initial.phone ?? ""}
          placeholder="010-0000-0000"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="체험 예정일">
          <input
            name="scheduled_at"
            type="datetime-local"
            defaultValue={initial.scheduled_at ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="실제 참석일">
          <input
            name="attended_at"
            type="datetime-local"
            defaultValue={initial.attended_at ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="상태">
          <select
            name="status"
            defaultValue={initial.status ?? "계획"}
            className={inputCls}
          >
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="목표 (이 사람이 PT로 이루고 싶은 것)">
        <input
          name="goal"
          defaultValue={initial.goal ?? ""}
          placeholder="예: 출산 후 체형 복원 + 체력 회복"
          className={inputCls}
        />
      </Field>

      <Field label="고민·걱정 (등록을 망설이게 하는 요소)">
        <textarea
          name="concerns"
          defaultValue={initial.concerns ?? ""}
          rows={2}
          placeholder="예: 비용 부담, 시간 부족, 과거 운동 포기 경험"
          className={textareaCls}
        />
      </Field>

      <Field label="상담 중 나눈 이야기 (AI 전략의 핵심 소스)">
        <textarea
          name="discussed"
          defaultValue={initial.discussed ?? ""}
          rows={4}
          placeholder="체험 전·중 나눈 대화, 본인이 한 말, 표정·태도 관찰 등. 구체적일수록 좋음."
          className={textareaCls}
        />
      </Field>

      <Field label="후속 메모">
        <textarea
          name="followup_notes"
          defaultValue={initial.followup_notes ?? ""}
          rows={2}
          placeholder="예: 금요일까지 안부 문자, 다음 주 수업 제안"
          className={textareaCls}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
const textareaCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

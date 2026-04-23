// 회원 추가·수정에서 공통으로 쓰는 폼 필드 묶음
// Server Component — 초기값은 props 로 주입

type InitialValues = Partial<{
  name: string;
  gender: string;
  age: number;
  phone: string;
  goal: string;
  health_notes: string;
  motivation: string;
  sessions_total: number;
  sessions_used: number;
  status: string;
  notes: string;
}>;

const STATUS_LIST = ["활발", "관심필요", "재등록임박", "중단"];

export function MemberForm({ initial = {} }: { initial?: InitialValues }) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="이름 *" required>
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

      <Field label="목표">
        <input
          name="goal"
          defaultValue={initial.goal ?? ""}
          placeholder="예: 3개월 내 체중 6kg 감량 · 체력 회복"
          className={inputCls}
        />
      </Field>

      <Field label="컨디션 · 질환 · 부상">
        <textarea
          name="health_notes"
          defaultValue={initial.health_notes ?? ""}
          rows={2}
          placeholder="예: 허리 디스크 경증, 무릎 통증 간헐적"
          className={textareaCls}
        />
      </Field>

      <Field label="운동을 시작한 계기 / 진짜 이유">
        <textarea
          name="motivation"
          defaultValue={initial.motivation ?? ""}
          rows={2}
          placeholder="예: 딸 결혼식 · 건강검진 결과 충격 · 옛 옷 다시 입고 싶음"
          className={textareaCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="총 세션">
          <input
            name="sessions_total"
            type="number"
            min={0}
            defaultValue={initial.sessions_total ?? 0}
            className={inputCls}
          />
        </Field>
        <Field label="사용한 세션">
          <input
            name="sessions_used"
            type="number"
            min={0}
            defaultValue={initial.sessions_used ?? 0}
            className={inputCls}
          />
        </Field>
        <Field label="상태">
          <select
            name="status"
            defaultValue={initial.status ?? "활발"}
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

      <Field label="상담 · 수업 메모 (AI 전략의 핵심 소스)">
        <textarea
          name="notes"
          defaultValue={initial.notes ?? ""}
          rows={5}
          placeholder="회원이 한 말·기분·몸 반응 등. 자세할수록 AI 전략 품질이 올라갑니다."
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

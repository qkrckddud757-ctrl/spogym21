"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUS = ["예정", "완료", "등록", "놓침"] as const;

export type TrialUpdateState = {
  ok: boolean;
  error?: string;
  at?: number;
} | null;

export async function createTrial(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("이름은 필수입니다.");

  const payload = {
    trainer_id: user.id,
    name,
    gender: nullable(formData.get("gender")),
    age: toNumber(formData.get("age")),
    phone: nullable(formData.get("phone")),
    scheduled_at: parseDatetime(formData.get("scheduled_at")),
    attended_at: parseDatetime(formData.get("attended_at")),
    status: pickStatus(String(formData.get("status") ?? "")),
    goal: nullable(formData.get("goal")),
    concerns: nullable(formData.get("concerns")),
    discussed: nullable(formData.get("discussed")),
    followup_notes: nullable(formData.get("followup_notes")),
  };

  const { data, error } = await supabase
    .from("ot_trials")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/trials");
  redirect(`/trials/${data.id}`);
}

export async function updateTrial(
  id: string,
  _prev: TrialUpdateState,
  formData: FormData,
): Promise<TrialUpdateState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "로그인이 필요합니다." };

    const nameRaw = String(formData.get("name") ?? "").trim();
    if (!nameRaw) return { ok: false, error: "이름은 필수입니다." };

    const payload = {
      name: nameRaw,
      gender: nullable(formData.get("gender")),
      age: toNumber(formData.get("age")),
      phone: nullable(formData.get("phone")),
      scheduled_at: parseDatetime(formData.get("scheduled_at")),
      attended_at: parseDatetime(formData.get("attended_at")),
      status: pickStatus(String(formData.get("status") ?? "")),
      goal: nullable(formData.get("goal")),
      concerns: nullable(formData.get("concerns")),
      discussed: nullable(formData.get("discussed")),
      followup_notes: nullable(formData.get("followup_notes")),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("ot_trials")
      .update(payload)
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/trials/${id}`);
    revalidatePath("/trials");
    return { ok: true, at: Date.now() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteTrial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ot_trials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/trials");
  redirect("/trials");
}

function toNumber(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function nullable(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s || null;
}

function pickStatus(s: string) {
  const v = s.trim();
  return (VALID_STATUS as readonly string[]).includes(v) ? v : "예정";
}

function parseDatetime(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

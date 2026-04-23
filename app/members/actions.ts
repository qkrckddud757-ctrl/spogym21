"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUS = ["활발", "관심필요", "재등록임박", "중단"] as const;

export async function createMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "로그인 필요" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false as const, error: "이름은 필수입니다." };

  const payload = {
    trainer_id: user.id,
    name,
    gender: (String(formData.get("gender") ?? "").trim() || null) as string | null,
    age: toNumber(formData.get("age")),
    phone: String(formData.get("phone") ?? "").trim() || null,
    goal: String(formData.get("goal") ?? "").trim() || null,
    health_notes: String(formData.get("health_notes") ?? "").trim() || null,
    motivation: String(formData.get("motivation") ?? "").trim() || null,
    sessions_total: toNumber(formData.get("sessions_total")) ?? 0,
    sessions_used: toNumber(formData.get("sessions_used")) ?? 0,
    status: pickStatus(String(formData.get("status") ?? "")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  const { data, error } = await supabase
    .from("pt_members")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/members");
  redirect(`/members/${data.id}`);
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "로그인 필요" };

  const payload = {
    name: String(formData.get("name") ?? "").trim() || undefined,
    gender: String(formData.get("gender") ?? "").trim() || null,
    age: toNumber(formData.get("age")),
    phone: String(formData.get("phone") ?? "").trim() || null,
    goal: String(formData.get("goal") ?? "").trim() || null,
    health_notes: String(formData.get("health_notes") ?? "").trim() || null,
    motivation: String(formData.get("motivation") ?? "").trim() || null,
    sessions_total: toNumber(formData.get("sessions_total")) ?? 0,
    sessions_used: toNumber(formData.get("sessions_used")) ?? 0,
    status: pickStatus(String(formData.get("status") ?? "")),
    notes: String(formData.get("notes") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("pt_members")
    .update(payload)
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath(`/members/${id}`);
  revalidatePath("/members");
  return { ok: true as const };
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pt_members").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/members");
  redirect("/members");
}

function toNumber(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickStatus(s: string) {
  const v = s.trim();
  return (VALID_STATUS as readonly string[]).includes(v) ? v : "활발";
}

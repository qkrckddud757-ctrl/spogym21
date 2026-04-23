"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUS = ["활발", "관심필요", "재등록임박", "중단"] as const;

// <form action> 용 server action 은 Promise<void> 반환해야 해서 에러는 throw 로 처리.
// Next.js 가 throw 를 캐치해서 에러 바운더리로 보냄.

export async function createMember(formData: FormData) {
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
    goal: nullable(formData.get("goal")),
    health_notes: nullable(formData.get("health_notes")),
    motivation: nullable(formData.get("motivation")),
    sessions_total: toNumber(formData.get("sessions_total")) ?? 0,
    sessions_used: toNumber(formData.get("sessions_used")) ?? 0,
    status: pickStatus(String(formData.get("status") ?? "")),
    notes: nullable(formData.get("notes")),
  };

  const { data, error } = await supabase
    .from("pt_members")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/members");
  redirect(`/members/${data.id}`);
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const payload = {
    name: String(formData.get("name") ?? "").trim() || undefined,
    gender: nullable(formData.get("gender")),
    age: toNumber(formData.get("age")),
    phone: nullable(formData.get("phone")),
    goal: nullable(formData.get("goal")),
    health_notes: nullable(formData.get("health_notes")),
    motivation: nullable(formData.get("motivation")),
    sessions_total: toNumber(formData.get("sessions_total")) ?? 0,
    sessions_used: toNumber(formData.get("sessions_used")) ?? 0,
    status: pickStatus(String(formData.get("status") ?? "")),
    notes: nullable(formData.get("notes")),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("pt_members")
    .update(payload)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/members/${id}`);
  revalidatePath("/members");
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pt_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
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

function nullable(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s || null;
}

function pickStatus(s: string) {
  const v = s.trim();
  return (VALID_STATUS as readonly string[]).includes(v) ? v : "활발";
}

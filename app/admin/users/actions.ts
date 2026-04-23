"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_RANKS = ["manager", "leader", "senior", "staff"] as const;
type Rank = (typeof VALID_RANKS)[number];

export async function updateProfile(formData: {
  id: string;
  rank: string;
  team: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  // 로그인 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  // 본인 직급 확인 → 매니저만 수정 가능
  const { data: me } = await supabase
    .from("profiles")
    .select("rank")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.rank !== "manager") {
    return { ok: false, error: "권한이 없습니다 (매니저 전용)." };
  }

  // 직급 값 검증
  if (!VALID_RANKS.includes(formData.rank as Rank)) {
    return { ok: false, error: "잘못된 직급 값입니다." };
  }

  // 업데이트
  const { error } = await supabase
    .from("profiles")
    .update({
      rank: formData.rank,
      team: formData.team && formData.team.trim() ? formData.team.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", formData.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

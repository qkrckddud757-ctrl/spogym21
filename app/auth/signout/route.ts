import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 로그아웃 → 세션 쿠키 제거 → /login 으로 리다이렉트
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

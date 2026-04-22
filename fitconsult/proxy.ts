import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: "middleware.ts" 에서 "proxy.ts" 로 파일명·export명이 변경됨.
// 세션 갱신·보호된 경로 리다이렉트는 lib/supabase/middleware.ts 의 updateSession 에서 수행.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 자원·이미지 제외하고 전부 매칭
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

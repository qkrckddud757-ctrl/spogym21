import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import { buildPtStrategyPrompt } from "@/lib/prompts/pt-strategy";

export const runtime = "nodejs"; // Gemini SDK 는 Node 런타임 필요
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { memberId } = (await request.json()) as { memberId?: string };
    if (!memberId) {
      return NextResponse.json(
        { error: "memberId 가 필요합니다." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    // 회원 조회 (RLS 가 본인 담당 회원만 허용)
    const { data: member, error: fetchErr } = await supabase
      .from("pt_members")
      .select(
        "id, name, gender, age, goal, health_notes, motivation, sessions_total, sessions_used, status, notes",
      )
      .eq("id", memberId)
      .maybeSingle();

    if (fetchErr || !member) {
      return NextResponse.json(
        { error: "회원 조회 실패 (권한 또는 미존재)" },
        { status: 404 },
      );
    }

    const prompt = buildPtStrategyPrompt(member);

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const strategyText = response.text ?? "";

    // DB 에 저장
    const nowIso = new Date().toISOString();
    await supabase
      .from("pt_members")
      .update({
        ai_strategy: strategyText,
        ai_strategy_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", memberId);

    return NextResponse.json({
      strategy: strategyText,
      generatedAt: nowIso,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

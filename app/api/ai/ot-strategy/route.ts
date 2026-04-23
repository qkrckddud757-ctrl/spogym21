import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import { buildOtStrategyPrompt } from "@/lib/prompts/ot-strategy";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { trialId } = (await request.json()) as { trialId?: string };
    if (!trialId) {
      return NextResponse.json({ error: "trialId 필요" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    const { data: trial, error } = await supabase
      .from("ot_trials")
      .select(
        "id, name, gender, age, scheduled_at, attended_at, status, goal, concerns, discussed, followup_notes",
      )
      .eq("id", trialId)
      .maybeSingle();

    if (error || !trial) {
      return NextResponse.json({ error: "조회 실패" }, { status: 404 });
    }

    const prompt = buildOtStrategyPrompt(trial);
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const text = response.text ?? "";

    const nowIso = new Date().toISOString();
    await supabase
      .from("ot_trials")
      .update({
        ai_strategy: text,
        ai_strategy_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", trialId);

    return NextResponse.json({ strategy: text, generatedAt: nowIso });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

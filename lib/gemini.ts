// Gemini (Vertex AI) 래퍼
// 서비스 계정 JSON(base64) 를 환경변수에서 디코딩 → GoogleGenAI SDK에 주입.
// 서버리스(Vercel)에서 파일 없이 inline credentials 로 동작.

import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (_ai) return _ai;

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
  const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;

  if (!project) throw new Error("GOOGLE_CLOUD_PROJECT env 미설정");
  if (!base64) throw new Error("GOOGLE_CREDENTIALS_BASE64 env 미설정");

  const credentials = JSON.parse(
    Buffer.from(base64, "base64").toString("utf8"),
  );

  _ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
    googleAuthOptions: { credentials },
  });

  return _ai;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

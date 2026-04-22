import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { VertexAI } from '@google-cloud/vertexai';

// .env.local 은 레포 루트에 있음 (부모 폴더)
const envPath = new URL('../.env.local', import.meta.url);
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

// base64 디코딩 후 임시 키 파일 생성
const b64 = process.env.GOOGLE_CREDENTIALS_BASE64;
if (!b64) throw new Error('GOOGLE_CREDENTIALS_BASE64 가 .env.local 에 없습니다.');
const keyPath = join(tmpdir(), 'gcp-key.json');
writeFileSync(keyPath, Buffer.from(b64, 'base64').toString('utf8'));
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

// Vertex AI → Gemini 호출
const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});
const model = vertex.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
});

console.log('프로젝트:', process.env.GOOGLE_CLOUD_PROJECT);
console.log('리전   :', process.env.GOOGLE_CLOUD_LOCATION);
console.log('모델   :', process.env.GEMINI_MODEL || 'gemini-2.5-flash');
console.log('호출 중...\n');

const result = await model.generateContent(
  '딱 한 문장만 한국어로: "안녕하세요, Gemini 연결 성공!"이라고 답해줘.'
);
const text = result.response.candidates[0].content.parts[0].text.trim();

console.log('=== Gemini 응답 ===');
console.log(text);
console.log('\n[OK] 연결 성공 — 서비스 계정·프로젝트·리전·모델 모두 정상');

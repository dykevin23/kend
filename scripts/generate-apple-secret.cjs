/**
 * Apple Sign in with Apple - Client Secret (JWT) 생성 스크립트
 *
 * 사용법:
 *   1. 아래 CONFIG 섹션의 4개 값을 채운다
 *   2. npm install jsonwebtoken (최초 1회)
 *   3. node scripts/generate-apple-secret.cjs
 *   4. 출력된 JWT를 Supabase Dashboard → Authentication → Providers → Apple
 *      → Secret Key (for OAuth) 필드에 붙여넣고 저장
 *
 * 주의:
 *   - Apple JWT 최대 유효기간은 180일(6개월). 만료 전 재실행 필요.
 *   - .p8 파일은 절대 git에 커밋하지 말 것.
 *   - 이 파일에 실제 값을 채운 상태로 커밋하지 말 것.
 */

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// ============================================================
// CONFIG - 아래 4개 값을 채우세요
// ============================================================

// Apple Developer 계정 Team ID (10자리 영숫자)
// 확인: https://developer.apple.com/account → Membership details
const TEAM_ID = "YOUR_TEAM_ID";

// Sign in with Apple Key ID (10자리 영숫자)
// 확인: Apple Developer → Certificates, IDs & Profiles → Keys → 생성한 키 클릭
const KEY_ID = "YOUR_KEY_ID";

// Services ID (Supabase Apple Provider의 Client ID와 동일해야 함)
const SERVICES_ID = "com.kend.app.signin";

// .p8 Private Key 파일 경로 (절대 경로 또는 이 스크립트 기준 상대 경로)
// ⚠️ 프로젝트 저장소 바깥 경로를 권장 (예: ~/Desktop/AuthKey_XXXXX.p8)
const P8_PATH = "/ABSOLUTE/PATH/TO/AuthKey_YOUR_KEY_ID.p8";

// ============================================================
// 실행 로직 (수정 불필요)
// ============================================================

function assertFilled(name, value, placeholder) {
  if (!value || value === placeholder) {
    console.error(`❌ ${name}를 채워주세요 (현재: "${value}")`);
    process.exit(1);
  }
}

assertFilled("TEAM_ID", TEAM_ID, "YOUR_TEAM_ID");
assertFilled("KEY_ID", KEY_ID, "YOUR_KEY_ID");
assertFilled("SERVICES_ID", SERVICES_ID, "");
assertFilled("P8_PATH", P8_PATH, "/ABSOLUTE/PATH/TO/AuthKey_YOUR_KEY_ID.p8");

const resolvedPath = path.resolve(P8_PATH);
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ .p8 파일을 찾을 수 없습니다: ${resolvedPath}`);
  process.exit(1);
}

const privateKey = fs.readFileSync(resolvedPath);

const token = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: TEAM_ID,
  audience: "https://appleid.apple.com",
  subject: SERVICES_ID,
  keyid: KEY_ID,
});

const decoded = jwt.decode(token);
const expDate = new Date(decoded.exp * 1000);

console.log("\n✅ Apple Client Secret (JWT) 생성 완료\n");
console.log("---------- 복사해서 Supabase에 붙여넣기 ----------");
console.log(token);
console.log("--------------------------------------------------\n");
console.log(`만료일: ${expDate.toLocaleString("ko-KR")}`);
console.log(
  `유효기간: 약 ${Math.round((decoded.exp - decoded.iat) / 86400)}일`,
);
console.log(
  `\n⚠️ ${expDate.toLocaleDateString(
    "ko-KR",
  )} 전에 이 스크립트를 재실행하여 새 JWT를 발급받으세요.\n`,
);

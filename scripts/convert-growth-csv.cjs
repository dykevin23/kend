/**
 * CSV to TypeScript 변환 스크립트
 * 성장도표 CSV 파일들을 TypeScript 파일로 변환합니다.
 */

const fs = require("fs");
const path = require("path");

const REFERENCES_DIR = path.join(__dirname, "..", "references");
const OUTPUT_DIR = path.join(__dirname, "..", "app", "lib", "growth-data");

// 출력 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * CSV 파싱 (두 줄 헤더 지원)
 * 첫 번째 줄: 메인 헤더 (성별, 만나이 등)
 * 두 번째 줄: 서브 헤더 (1st, 3rd 등 백분위수)
 */
function parseCSV(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  const mainHeaders = lines[0].split(",").map((h) => h.trim().replace(/^\uFEFF/, "")); // BOM 제거
  const subHeaders = lines[1].split(",").map((h) => h.trim());

  // 헤더 병합: 메인 헤더가 비어있으면 서브 헤더 사용
  const headers = mainHeaders.map((h, idx) => {
    if (h && h !== "") return h;
    return subHeaders[idx] || "";
  });

  const data = [];
  for (let i = 2; i < lines.length; i++) {
    // 첫 2줄은 헤더
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length < 6) continue;

    const row = {};
    headers.forEach((header, idx) => {
      const value = values[idx];
      if (value !== undefined && value !== "") {
        // 숫자로 변환 시도
        const num = parseFloat(value);
        row[header] = isNaN(num) ? value : num;
      }
    });
    data.push(row);
  }
  return { headers, data };
}

/**
 * 연령별 데이터 변환 (성장, 체중, 머리둘레, BMI)
 */
function toDashCase(str) {
  return str.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
}

function convertAgeBasedData(filename, outputName) {
  const outputFilename = toDashCase(outputName);
  const content = fs.readFileSync(path.join(REFERENCES_DIR, filename), "utf-8");
  const { data } = parseCSV(content);

  // 필요한 컬럼만 추출: 성별, 만나이(개월), L, M, S, 주요 백분위수
  const result = [];
  let lastGender = null;

  for (const row of data) {
    const gender = row["성별"] ?? lastGender;
    lastGender = gender;

    const ageMonths = row["만나이(개월)"];
    if (gender === undefined || ageMonths === undefined) continue;

    result.push({
      gender: Number(gender),
      ageMonths: Number(ageMonths),
      L: Number(row["L"]),
      M: Number(row["M"]),
      S: Number(row["S"]),
      // 그래프용 백분위수 (3rd, 10th, 25th, 50th, 75th, 90th, 97th)
      p3: Number(row["3rd"]),
      p10: Number(row["10th"]),
      p25: Number(row["25th"]),
      p50: Number(row["50th"]),
      p75: Number(row["75th"]),
      p90: Number(row["90th"]),
      p97: Number(row["97th"]),
    });
  }

  // TypeScript 파일 생성
  const tsContent = `// 자동 생성된 파일 - 직접 수정하지 마세요
// 원본: /references/${filename}

export interface AgeBasedGrowthData {
  gender: 1 | 2; // 1=남, 2=여
  ageMonths: number;
  L: number;
  M: number;
  S: number;
  p3: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p97: number;
}

export const ${outputName}: AgeBasedGrowthData[] = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${outputFilename}.ts`), tsContent);
  console.log(`✓ ${outputFilename}.ts 생성 완료 (${result.length}개 행)`);
}

/**
 * 신장별 체중 데이터 변환
 */
function convertHeightBasedData(filename, outputName, heightKey) {
  const outputFilename = toDashCase(outputName);
  const content = fs.readFileSync(path.join(REFERENCES_DIR, filename), "utf-8");
  const { data } = parseCSV(content);

  const result = [];
  let lastGender = null;

  for (const row of data) {
    const gender = row["성별"] ?? lastGender;
    lastGender = gender;

    const height = row[heightKey];
    if (gender === undefined || height === undefined) continue;

    result.push({
      gender: Number(gender),
      height: Number(height),
      L: Number(row["L"]),
      M: Number(row["M"]),
      S: Number(row["S"]),
      p3: Number(row["3rd"]),
      p10: Number(row["10th"]),
      p25: Number(row["25th"]),
      p50: Number(row["50th"]),
      p75: Number(row["75th"]),
      p90: Number(row["90th"]),
      p97: Number(row["97th"]),
    });
  }

  const tsContent = `// 자동 생성된 파일 - 직접 수정하지 마세요
// 원본: /references/${filename}

export interface HeightBasedWeightData {
  gender: 1 | 2; // 1=남, 2=여
  height: number; // cm
  L: number;
  M: number;
  S: number;
  p3: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p97: number;
}

export const ${outputName}: HeightBasedWeightData[] = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${outputFilename}.ts`), tsContent);
  console.log(`✓ ${outputFilename}.ts 생성 완료 (${result.length}개 행)`);
}

// 실행
console.log("성장도표 CSV → TypeScript 변환 시작...\n");

// 연령별 데이터
convertAgeBasedData("연령별성장.csv", "heightForAge");
convertAgeBasedData("연령별체중.csv", "weightForAge");
convertAgeBasedData("연령별머리둘레.csv", "headCircumferenceForAge");
convertAgeBasedData("연령별체질량지수.csv", "bmiForAge");

// 신장별 체중 데이터
convertHeightBasedData("신장별체중(2세미만).csv", "weightForLengthUnder2", "누운키(cm)");
convertHeightBasedData("신장별체중(2-3세미만).csv", "weightForHeight2to3", "선키(cm)");
convertHeightBasedData("신장별체중(3세이상).csv", "weightForHeightOver3", "선키(cm)");

console.log("\n변환 완료!");

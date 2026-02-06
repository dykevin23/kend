/**
 * 성장도표 계산 유틸리티
 * 2017 소아청소년 성장도표 이용지침서 기준
 */

import { heightForAge, type AgeBasedGrowthData } from "./height-for-age";
import { weightForAge } from "./weight-for-age";
import { headCircumferenceForAge } from "./head-circumference-for-age";
import { bmiForAge } from "./bmi-for-age";
import {
  weightForLengthUnder2,
  type HeightBasedWeightData,
} from "./weight-for-length-under-2";
import { weightForHeight2to3 } from "./weight-for-height-2to-3";
import { weightForHeightOver3 } from "./weight-for-height-over-3";

export type Gender = 1 | 2; // 1=남, 2=여

/**
 * 표준정규분포 누적분포함수 (CDF)
 * Excel의 NORMSDIST()와 동일한 결과를 반환
 */
export function normsdist(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Z-score 계산
 * @param x - 측정값 (신장, 체중, BMI 등)
 * @param L - Box-Cox 변환 지수
 * @param M - 중앙값
 * @param S - 변이계수
 */
export function calculateZScore(
  x: number,
  L: number,
  M: number,
  S: number
): number {
  if (L !== 0) {
    return (Math.pow(x / M, L) - 1) / (L * S);
  }
  return Math.log(x / M) / S;
}

/**
 * 백분위수 계산
 * @param x - 측정값
 * @param L - Box-Cox 변환 지수
 * @param M - 중앙값
 * @param S - 변이계수
 * @returns 백분위수 (0~100)
 */
export function calculatePercentile(
  x: number,
  L: number,
  M: number,
  S: number
): number {
  const z = calculateZScore(x, L, M, S);
  return normsdist(z) * 100;
}

/**
 * 연령 계산 (개월)
 * @param birthDate - 생년월일
 * @param measureDate - 측정일
 * @returns 연령 (개월, 반올림된 정수)
 */
export function calculateAgeInMonths(
  birthDate: Date,
  measureDate: Date
): number {
  const years = measureDate.getFullYear() - birthDate.getFullYear();
  const months = measureDate.getMonth() - birthDate.getMonth();
  const days = measureDate.getDate() - birthDate.getDate();

  const ageInMonths = years * 12 + months + days / 30.5;
  return Math.round(ageInMonths);
}

/**
 * BMI 계산
 * @param weightKg - 체중 (kg)
 * @param heightCm - 신장 (cm)
 * @returns BMI (kg/m²)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * 연령별 데이터에서 LMS 값 조회
 */
function getLMSFromAgeData(
  data: AgeBasedGrowthData[],
  gender: Gender,
  ageMonths: number
): { L: number; M: number; S: number } | null {
  const row = data.find(
    (d) => d.gender === gender && d.ageMonths === ageMonths
  );
  return row ? { L: row.L, M: row.M, S: row.S } : null;
}

/**
 * 신장별 데이터에서 LMS 값 조회 (가장 가까운 신장 값 사용)
 */
function getLMSFromHeightData(
  data: HeightBasedWeightData[],
  gender: Gender,
  heightCm: number
): { L: number; M: number; S: number } | null {
  // 해당 성별 데이터만 필터
  const genderData = data.filter((d) => d.gender === gender);
  if (genderData.length === 0) return null;

  // 가장 가까운 신장 찾기
  let closest = genderData[0];
  let minDiff = Math.abs(closest.height - heightCm);

  for (const row of genderData) {
    const diff = Math.abs(row.height - heightCm);
    if (diff < minDiff) {
      minDiff = diff;
      closest = row;
    }
  }

  return { L: closest.L, M: closest.M, S: closest.S };
}

// ============================================
// 공개 API
// ============================================

export interface GrowthResult {
  value: number;
  percentile: number;
  zScore: number;
}

/**
 * 연령별 신장 백분위수 계산
 */
export function getHeightPercentile(
  gender: Gender,
  ageMonths: number,
  heightCm: number
): GrowthResult | null {
  const lms = getLMSFromAgeData(heightForAge, gender, ageMonths);
  if (!lms) return null;

  const zScore = calculateZScore(heightCm, lms.L, lms.M, lms.S);
  const percentile = normsdist(zScore) * 100;

  return { value: heightCm, percentile, zScore };
}

/**
 * 연령별 체중 백분위수 계산
 */
export function getWeightPercentile(
  gender: Gender,
  ageMonths: number,
  weightKg: number
): GrowthResult | null {
  const lms = getLMSFromAgeData(weightForAge, gender, ageMonths);
  if (!lms) return null;

  const zScore = calculateZScore(weightKg, lms.L, lms.M, lms.S);
  const percentile = normsdist(zScore) * 100;

  return { value: weightKg, percentile, zScore };
}

/**
 * 연령별 머리둘레 백분위수 계산 (0~72개월만)
 */
export function getHeadCircumferencePercentile(
  gender: Gender,
  ageMonths: number,
  circumferenceCm: number
): GrowthResult | null {
  if (ageMonths > 72) return null;

  const lms = getLMSFromAgeData(headCircumferenceForAge, gender, ageMonths);
  if (!lms) return null;

  const zScore = calculateZScore(circumferenceCm, lms.L, lms.M, lms.S);
  const percentile = normsdist(zScore) * 100;

  return { value: circumferenceCm, percentile, zScore };
}

/**
 * 연령별 BMI 백분위수 계산 (24개월 이상)
 */
export function getBMIPercentile(
  gender: Gender,
  ageMonths: number,
  weightKg: number,
  heightCm: number
): GrowthResult | null {
  if (ageMonths < 24) return null;

  const bmi = calculateBMI(weightKg, heightCm);
  const lms = getLMSFromAgeData(bmiForAge, gender, ageMonths);
  if (!lms) return null;

  const zScore = calculateZScore(bmi, lms.L, lms.M, lms.S);
  const percentile = normsdist(zScore) * 100;

  return { value: bmi, percentile, zScore };
}

/**
 * 신장별 체중 백분위수 계산
 * 연령에 따라 적절한 데이터 선택
 */
export function getWeightForHeightPercentile(
  gender: Gender,
  ageMonths: number,
  heightCm: number,
  weightKg: number
): GrowthResult | null {
  let data: HeightBasedWeightData[];

  if (ageMonths < 24) {
    data = weightForLengthUnder2;
  } else if (ageMonths < 36) {
    data = weightForHeight2to3;
  } else {
    data = weightForHeightOver3;
  }

  const lms = getLMSFromHeightData(data, gender, heightCm);
  if (!lms) return null;

  const zScore = calculateZScore(weightKg, lms.L, lms.M, lms.S);
  const percentile = normsdist(zScore) * 100;

  return { value: weightKg, percentile, zScore };
}

/**
 * 종합 성장 평가
 */
export interface GrowthAssessment {
  ageMonths: number;
  height: GrowthResult | null;
  weight: GrowthResult | null;
  bmi: GrowthResult | null;
  headCircumference: GrowthResult | null;
  weightForHeight: GrowthResult | null;
}

export function assessGrowth(
  gender: Gender,
  birthDate: Date,
  measureDate: Date,
  heightCm: number,
  weightKg: number,
  headCircumferenceCm?: number
): GrowthAssessment {
  const ageMonths = calculateAgeInMonths(birthDate, measureDate);

  return {
    ageMonths,
    height: getHeightPercentile(gender, ageMonths, heightCm),
    weight: getWeightPercentile(gender, ageMonths, weightKg),
    bmi: getBMIPercentile(gender, ageMonths, weightKg, heightCm),
    headCircumference: headCircumferenceCm
      ? getHeadCircumferencePercentile(gender, ageMonths, headCircumferenceCm)
      : null,
    weightForHeight: getWeightForHeightPercentile(
      gender,
      ageMonths,
      heightCm,
      weightKg
    ),
  };
}

// 그래프용 백분위 곡선 데이터 export
export {
  heightForAge,
  weightForAge,
  headCircumferenceForAge,
  bmiForAge,
  weightForLengthUnder2,
  weightForHeight2to3,
  weightForHeightOver3,
};

/**
 * 성장도표 데이터 및 계산 유틸리티
 * 2017 소아청소년 성장도표 기준
 */

// 계산 함수 및 유틸리티
export {
  // 기본 계산 함수
  normsdist,
  calculateZScore,
  calculatePercentile,
  calculateAgeInMonths,
  calculateBMI,
  // 백분위수 조회 함수
  getHeightPercentile,
  getWeightPercentile,
  getHeadCircumferencePercentile,
  getBMIPercentile,
  getWeightForHeightPercentile,
  // 종합 평가
  assessGrowth,
  // 타입
  type Gender,
  type GrowthResult,
  type GrowthAssessment,
} from "./calculations";

// 원본 데이터 (그래프 렌더링용)
export { heightForAge, type AgeBasedGrowthData } from "./height-for-age";
export { weightForAge } from "./weight-for-age";
export { headCircumferenceForAge } from "./head-circumference-for-age";
export { bmiForAge } from "./bmi-for-age";
export {
  weightForLengthUnder2,
  type HeightBasedWeightData,
} from "./weight-for-length-under-2";
export { weightForHeight2to3 } from "./weight-for-height-2to-3";
export { weightForHeightOver3 } from "./weight-for-height-over-3";

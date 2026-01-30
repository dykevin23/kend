import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import { getNextChildCode } from "./queries";

type Client = SupabaseClient<Database>;

// ============================================================
// 자녀 관련 mutations
// ============================================================

interface CreateChildInput {
  userId: string;
  nickname: string;
  name?: string;
  gender?: "boy" | "girl";
  birthDate: string; // YYYY-MM-DD
  profileImageUrl?: string;
}

/**
 * 자녀 추가
 */
export const createChild = async (client: Client, input: CreateChildInput) => {
  const { userId, nickname, name, gender, birthDate, profileImageUrl } = input;

  // 다음 code 조회
  const nextCode = await getNextChildCode(client, userId);

  const { data, error } = await client
    .from("children")
    .insert({
      user_id: userId,
      code: nextCode,
      nickname,
      name: name ?? null,
      gender: gender ?? null,
      birth_date: birthDate,
      profile_image_url: profileImageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    code: data.code,
    nickname: data.nickname,
    name: data.name,
    gender: data.gender,
    birthDate: data.birth_date,
    profileImageUrl: data.profile_image_url,
  };
};

interface UpdateChildInput {
  childId: string;
  nickname?: string;
  name?: string;
  gender?: "boy" | "girl";
  birthDate?: string;
  profileImageUrl?: string;
}

/**
 * 자녀 정보 수정
 */
export const updateChild = async (client: Client, input: UpdateChildInput) => {
  const { childId, nickname, name, gender, birthDate, profileImageUrl } = input;

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (nickname !== undefined) updateData.nickname = nickname;
  if (name !== undefined) updateData.name = name;
  if (gender !== undefined) updateData.gender = gender;
  if (birthDate !== undefined) updateData.birth_date = birthDate;
  if (profileImageUrl !== undefined)
    updateData.profile_image_url = profileImageUrl;

  const { data, error } = await client
    .from("children")
    .update(updateData)
    .eq("id", childId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    code: data.code,
    nickname: data.nickname,
    name: data.name,
    gender: data.gender,
    birthDate: data.birth_date,
    profileImageUrl: data.profile_image_url,
  };
};

/**
 * 자녀 삭제
 */
export const deleteChild = async (client: Client, childId: string) => {
  const { error } = await client.from("children").delete().eq("id", childId);

  if (error) throw error;

  return { success: true };
};

/**
 * 자녀 프로필 이미지 업로드
 * 경로: profiles/{부모userId}/{자녀childId} (파일명)
 */
export const uploadChildProfileImage = async (
  client: Client,
  userId: string,
  childId: string,
  file: File
): Promise<string> => {
  const filePath = `${userId}/${childId}`;

  const { error: uploadError } = await client.storage
    .from("profiles")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from("profiles").getPublicUrl(filePath);

  return publicUrl;
};

// ============================================================
// 성장 기록 관련 mutations
// ============================================================

interface CreateGrowthRecordInput {
  childId: string;
  measuredAt: string; // YYYY-MM-DD
  height?: number;
  weight?: number;
  footSize?: number;
  headCircumference?: number;
}

/**
 * 성장 기록 추가
 */
export const createGrowthRecord = async (
  client: Client,
  input: CreateGrowthRecordInput
) => {
  const { childId, measuredAt, height, weight, footSize, headCircumference } =
    input;

  // 최소 하나의 측정값이 있어야 함
  if (
    height === undefined &&
    weight === undefined &&
    footSize === undefined &&
    headCircumference === undefined
  ) {
    throw new Error("최소 하나의 측정값을 입력해주세요.");
  }

  const { data, error } = await client
    .from("growth_records")
    .insert({
      child_id: childId,
      measured_at: measuredAt,
      height: height ?? null,
      weight: weight ?? null,
      foot_size: footSize ?? null,
      head_circumference: headCircumference ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    childId: data.child_id,
    measuredAt: data.measured_at,
    height: data.height ? Number(data.height) : null,
    weight: data.weight ? Number(data.weight) : null,
    footSize: data.foot_size ? Number(data.foot_size) : null,
    headCircumference: data.head_circumference
      ? Number(data.head_circumference)
      : null,
  };
};

interface UpdateGrowthRecordInput {
  recordId: string;
  measuredAt?: string;
  height?: number | null;
  weight?: number | null;
  footSize?: number | null;
  headCircumference?: number | null;
}

/**
 * 성장 기록 수정
 */
export const updateGrowthRecord = async (
  client: Client,
  input: UpdateGrowthRecordInput
) => {
  const { recordId, measuredAt, height, weight, footSize, headCircumference } =
    input;

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (measuredAt !== undefined) updateData.measured_at = measuredAt;
  if (height !== undefined) updateData.height = height;
  if (weight !== undefined) updateData.weight = weight;
  if (footSize !== undefined) updateData.foot_size = footSize;
  if (headCircumference !== undefined)
    updateData.head_circumference = headCircumference;

  const { data, error } = await client
    .from("growth_records")
    .update(updateData)
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    childId: data.child_id,
    measuredAt: data.measured_at,
    height: data.height ? Number(data.height) : null,
    weight: data.weight ? Number(data.weight) : null,
    footSize: data.foot_size ? Number(data.foot_size) : null,
    headCircumference: data.head_circumference
      ? Number(data.head_circumference)
      : null,
  };
};

/**
 * 성장 기록 삭제
 */
export const deleteGrowthRecord = async (client: Client, recordId: string) => {
  const { error } = await client
    .from("growth_records")
    .delete()
    .eq("id", recordId);

  if (error) throw error;

  return { success: true };
};

/**
 * 여러 성장 기록 한번에 추가 (자녀 등록 시 초기 데이터 입력용)
 */
export const createGrowthRecordsBatch = async (
  client: Client,
  childId: string,
  records: Omit<CreateGrowthRecordInput, "childId">[]
) => {
  const insertData = records
    .filter(
      (r) =>
        r.height !== undefined ||
        r.weight !== undefined ||
        r.footSize !== undefined ||
        r.headCircumference !== undefined
    )
    .map((record) => ({
      child_id: childId,
      measured_at: record.measuredAt,
      height: record.height ?? null,
      weight: record.weight ?? null,
      foot_size: record.footSize ?? null,
      head_circumference: record.headCircumference ?? null,
    }));

  if (insertData.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("growth_records")
    .insert(insertData)
    .select();

  if (error) throw error;

  return data.map((record) => ({
    id: record.id,
    childId: record.child_id,
    measuredAt: record.measured_at,
    height: record.height ? Number(record.height) : null,
    weight: record.weight ? Number(record.weight) : null,
    footSize: record.foot_size ? Number(record.foot_size) : null,
    headCircumference: record.head_circumference
      ? Number(record.head_circumference)
      : null,
  }));
};

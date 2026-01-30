import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 사용자 프로필 조회
 */
export const getUserProfile = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("profiles")
    .select("profile_id, nickname, username, phone, avatar, introduction, comment")
    .eq("profile_id", userId)
    .single();

  if (error) throw error;

  return {
    id: data.profile_id,
    nickname: data.nickname,
    username: data.username,
    phone: data.phone,
    avatar: data.avatar,
    introduction: data.introduction,
    comment: data.comment,
  };
};

export type UserProfile = Awaited<ReturnType<typeof getUserProfile>>;

/**
 * 사용자 배송지 목록 조회
 */
export const getUserAddresses = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((address) => ({
    id: address.id,
    label: address.label,
    recipientName: address.recipient_name,
    recipientPhone: address.recipient_phone,
    zoneCode: address.zone_code,
    address: address.address,
    addressDetail: address.address_detail,
    isDefault: address.is_default,
  }));
};

export type UserAddress = Awaited<ReturnType<typeof getUserAddresses>>[number];

/**
 * 기본 배송지 조회
 */
export const getDefaultAddress = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (error) {
    // 기본 배송지가 없는 경우 null 반환
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    id: data.id,
    label: data.label,
    recipientName: data.recipient_name,
    recipientPhone: data.recipient_phone,
    zoneCode: data.zone_code,
    address: data.address,
    addressDetail: data.address_detail,
    isDefault: data.is_default,
  };
};

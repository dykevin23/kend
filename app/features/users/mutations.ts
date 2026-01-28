import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

interface AddUserAddressInput {
  userId: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  zoneCode: string;
  address: string;
  addressDetail?: string;
  isDefault?: boolean;
}

/**
 * 사용자 배송지 추가
 */
export const addUserAddress = async (client: Client, input: AddUserAddressInput) => {
  const {
    userId,
    label,
    recipientName,
    recipientPhone,
    zoneCode,
    address,
    addressDetail,
    isDefault = false,
  } = input;

  // isDefault가 true인 경우 기존 기본 배송지 해제
  if (isDefault) {
    await client
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true);
  }

  const { data, error } = await client
    .from("user_addresses")
    .insert({
      user_id: userId,
      label,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      zone_code: zoneCode,
      address,
      address_detail: addressDetail ?? null,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) throw error;

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

interface UpdateUserAddressInput {
  addressId: string;
  userId: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  zoneCode: string;
  address: string;
  addressDetail?: string;
  isDefault?: boolean;
}

/**
 * 사용자 배송지 수정
 */
export const updateUserAddress = async (
  client: Client,
  input: UpdateUserAddressInput
) => {
  const {
    addressId,
    userId,
    label,
    recipientName,
    recipientPhone,
    zoneCode,
    address,
    addressDetail,
    isDefault = false,
  } = input;

  // isDefault가 true인 경우 기존 기본 배송지 해제
  if (isDefault) {
    await client
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true)
      .neq("id", addressId);
  }

  const { data, error } = await client
    .from("user_addresses")
    .update({
      label,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      zone_code: zoneCode,
      address,
      address_detail: addressDetail ?? null,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq("id", addressId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

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

interface DeleteUserAddressInput {
  addressId: string;
  userId: string;
}

/**
 * 사용자 배송지 삭제
 */
export const deleteUserAddress = async (
  client: Client,
  input: DeleteUserAddressInput
) => {
  const { addressId, userId } = input;

  const { error } = await client
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) throw error;

  return { success: true };
};

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
 * - 기본 배송지 삭제 시, 가장 최근 등록된 배송지를 기본으로 설정
 * - TODO: 추후 order_groups에 address_id 추가 후, 가장 최근 사용한 배송지로 변경
 */
export const deleteUserAddress = async (
  client: Client,
  input: DeleteUserAddressInput
) => {
  const { addressId, userId } = input;

  // 삭제하려는 배송지가 기본 배송지인지 확인
  const { data: addressToDelete } = await client
    .from("user_addresses")
    .select("is_default")
    .eq("id", addressId)
    .eq("user_id", userId)
    .single();

  const wasDefault = addressToDelete?.is_default ?? false;

  // 배송지 삭제
  const { error } = await client
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) throw error;

  // 기본 배송지였다면, 가장 최근 등록된 배송지를 기본으로 설정
  if (wasDefault) {
    const { data: remainingAddresses } = await client
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (remainingAddresses && remainingAddresses.length > 0) {
      await client
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", remainingAddresses[0].id);
    }
  }

  return { success: true };
};

import { z } from "zod";

/**
 * 배송지 추가 폼 validation 스키마
 */
export const addAddressSchema = z.object({
  label: z.string().min(1, "주소명을 입력해주세요."),
  recipientName: z.string().min(1, "수령인 이름을 입력해주세요."),
  recipientPhone: z
    .string()
    .min(1, "휴대폰 번호를 입력해주세요.")
    .regex(/^[0-9-]+$/, "올바른 휴대폰 번호를 입력해주세요."),
  zoneCode: z.string().min(1, "우편번호를 입력해주세요."),
  address: z.string().min(1, "주소를 입력해주세요."),
  addressDetail: z.string().optional(),
});

export type AddAddressInput = z.infer<typeof addAddressSchema>;

/**
 * FormData를 AddAddressInput으로 파싱
 */
export const parseAddAddressForm = (formData: FormData) => {
  return addAddressSchema.safeParse({
    label: formData.get("label")?.toString().trim() ?? "",
    recipientName: formData.get("recipientName")?.toString().trim() ?? "",
    recipientPhone: formData.get("recipientPhone")?.toString().trim() ?? "",
    zoneCode: formData.get("zoneCode")?.toString().trim() ?? "",
    address: formData.get("address")?.toString().trim() ?? "",
    addressDetail: formData.get("addressDetail")?.toString().trim() || undefined,
  });
};

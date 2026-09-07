import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 특정 구매확정 건(delivery_item)에 대해 리뷰 작성 가능한지 확인
 * 조건: 본인 소유 + normal 상태 + 구매확정 완료 + 아직 그 건으로 리뷰를 안 쓴 경우
 */
export const canReviewDeliveryItem = async (
  client: Client,
  userId: string,
  deliveryItemId: string
): Promise<boolean> => {
  const { data: existingReview } = await client
    .from("reviews")
    .select("id")
    .eq("delivery_item_id", deliveryItemId)
    .maybeSingle();

  if (existingReview) return false;

  const { data: deliveryItem, error } = await client
    .from("delivery_items")
    .select(
      `
      id,
      status,
      purchase_confirmed_at,
      order_items!inner (
        product_id,
        orders!inner (
          order_groups!inner ( user_id )
        )
      )
    `
    )
    .eq("id", deliveryItemId)
    .eq("order_items.orders.order_groups.user_id", userId)
    .eq("status", "normal")
    .not("purchase_confirmed_at", "is", null)
    .maybeSingle();

  if (error) throw error;
  return !!deliveryItem;
};

/**
 * 리뷰 이미지 업로드 (클라이언트에서 직접 storage 업로드, profiles 버킷과 동일 패턴)
 * 경로: reviews 버킷 / {userId}/{deliveryItemId}/{randomId}.{ext}
 * (storage RLS가 폴더 첫 세그먼트 = auth.uid()로 소유권 검증하므로 경로 형식 고정 필수)
 */
export const uploadReviewImage = async (
  client: Client,
  deliveryItemId: string,
  file: File
): Promise<string> => {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const userId = user.id;

  const ext = file.name.split(".").pop() ?? "jpg";
  const randomId = crypto.randomUUID();
  const filePath = `${userId}/${deliveryItemId}/${randomId}.${ext}`;

  const { error: uploadError } = await client.storage
    .from("reviews")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from("reviews").getPublicUrl(filePath);

  return publicUrl;
};

/**
 * 리뷰 작성 (첨부 이미지 URL 목록 포함 가능)
 */
export const createReview = async (
  client: Client,
  {
    userId,
    productId,
    deliveryItemId,
    rating,
    content,
    imageUrls = [],
  }: {
    userId: string;
    productId: string;
    deliveryItemId: string;
    rating: number;
    content: string;
    imageUrls?: string[];
  }
) => {
  if (rating < 1 || rating > 5) {
    throw new Error("별점은 1~5 사이여야 합니다.");
  }
  if (!content.trim()) {
    throw new Error("리뷰 내용을 입력해주세요.");
  }

  const canReview = await canReviewDeliveryItem(client, userId, deliveryItemId);
  if (!canReview) {
    throw new Error("리뷰를 작성할 수 없습니다. 구매확정한 주문인지, 이미 작성했는지 확인해주세요.");
  }

  const { data, error } = await client
    .from("reviews")
    .insert({
      user_id: userId,
      product_id: productId,
      delivery_item_id: deliveryItemId,
      rating,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  if (imageUrls.length > 0) {
    const { error: imagesError } = await client.from("review_images").insert(
      imageUrls.map((url) => ({ review_id: data.id, url }))
    );
    if (imagesError) throw imagesError;
  }

  return data;
};

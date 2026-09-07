import { useEffect, useRef, useState } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { X } from "lucide-react";
import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import StarRating from "~/common/components/star-rating";
import { cn } from "~/lib/utils";
import { validateImageFile } from "~/lib/validate-image";
import { browserClient } from "~/supa-client";
import { useAlert } from "~/hooks/useAlert";
import { uploadReviewImage } from "../mutations";

const MAX_IMAGES = 5;

interface ReviewWriteButtonProps {
  productId: string;
  deliveryItemId: string;
  productName: string;
  mainImage: string | null;
  options: Record<string, string> | null;
  salePrice: number;
  className?: string;
}

/**
 * 리뷰 작성 트리거 버튼 + 전체화면 팝업(Modal) — 페이지 이동이 아니라
 * 현재 화면 위에 뜨는 팝업이라 취소해도 뒤로가기 히스토리에 영향이 없다
 * (기존엔 별도 라우트 이동 방식이라 취소 시 뒤로가기 동작이 애매했던 문제).
 * 제출은 fetcher로 처리하고, 성공 시 팝업만 닫고 현재 페이지 데이터를 재검증한다.
 */
export default function ReviewWriteButton({
  productId,
  deliveryItemId,
  productName,
  mainImage,
  options,
  salePrice,
  className,
}: ReviewWriteButtonProps) {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const { alert } = useAlert();
  const hasHandledSuccessRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFileKeys, setSelectedFileKeys] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const isSubmitting = fetcher.state !== "idle";

  const resetForm = () => {
    setRating(0);
    setImageUrls([]);
    setSelectedFileKeys([]);
    setImageError(null);
    formRef.current?.reset();
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  useEffect(() => {
    if (open) hasHandledSuccessRef.current = false;
  }, [open]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.success && !hasHandledSuccessRef.current) {
      hasHandledSuccessRef.current = true;
      resetForm();
      setOpen(false);
      revalidator.revalidate();
    } else if (fetcher.data.success === false) {
      alert({
        title: "리뷰 등록 실패",
        message: fetcher.data.error ?? "리뷰 등록에 실패했어요.",
        primaryButton: { label: "확인" },
      });
    }
  }, [fetcher.data, fetcher.state]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (files.length === 0) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      setImageError(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }

    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        setImageError(error);
        return;
      }
    }

    // 같은 파일을 실수로 두 번 선택하는 경우 방지 — 파일명+용량으로 판단
    const newFileKeys = files.map((file) => `${file.name}:${file.size}`);
    if (
      newFileKeys.some((key) => selectedFileKeys.includes(key)) ||
      new Set(newFileKeys).size !== newFileKeys.length
    ) {
      setImageError("이미 선택한 사진이에요.");
      return;
    }

    setImageError(null);
    setIsUploadingImages(true);
    try {
      const urls = await Promise.all(
        files.map((file) => uploadReviewImage(browserClient, deliveryItemId, file))
      );
      setImageUrls((prev) => [...prev, ...urls]);
      setSelectedFileKeys((prev) => [...prev, ...newFileKeys]);
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다."
      );
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleRemoveImage = (url: string, index: number) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
    setSelectedFileKeys((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("text-xs", className)}
        onClick={() => setOpen(true)}
      >
        리뷰 작성
      </Button>

      <Modal
        open={open}
        title="리뷰 작성"
        onClose={handleClose}
        footer={
          <Button
            type="submit"
            form="review-write-form"
            className="w-full"
            disabled={rating === 0 || isSubmitting || isUploadingImages}
          >
            {isSubmitting ? "등록 중..." : "리뷰 등록"}
          </Button>
        }
      >
        <fetcher.Form
          ref={formRef}
          id="review-write-form"
          method="post"
          action="/myPage/reviews/action"
          className="flex flex-col w-full gap-4 px-4 py-4"
        >
          <input type="hidden" name="intent" value="create" />
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="deliveryItemId" value={deliveryItemId} />
          <input type="hidden" name="rating" value={rating} />
          {imageUrls.map((url) => (
            <input key={url} type="hidden" name="imageUrls" value={url} />
          ))}

          <div className="flex items-center gap-3">
            {mainImage ? (
              <img
                src={mainImage}
                alt={productName}
                className="size-14 rounded-md object-cover"
              />
            ) : (
              <div className="size-14 rounded-md bg-gray-200" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium line-clamp-2">{productName}</span>
              {options && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {Object.values(options).join(" / ")}
                </span>
              )}
              <span className="text-sm font-semibold text-gray-900 mt-0.5">
                {salePrice.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 py-4">
            <label className="text-xs text-gray-500">별점을 선택해주세요</label>
            <StarRating score={rating} onSelect={setRating} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">
              사진 첨부 ({imageUrls.length}/{MAX_IMAGES})
            </label>
            {imageError && (
              <span className="text-xs text-red-600">{imageError}</span>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {imageUrls.map((url, index) => (
                <div key={url} className="relative size-16 shrink-0">
                  <img
                    src={url}
                    alt="첨부 이미지"
                    className="size-16 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url, index)}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-gray-900/70 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {imageUrls.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImages}
                  className="flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-muted/40 text-muted disabled:opacity-50"
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="text-[10px]">
                    {isUploadingImages ? "업로드 중" : "사진"}
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">리뷰 내용</label>
            <textarea
              name="content"
              placeholder="상품에 대한 솔직한 리뷰를 남겨주세요"
              required
              rows={8}
              className={cn(
                "border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              )}
            />
          </div>
        </fetcher.Form>
      </Modal>
    </>
  );
}

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { Camera, Loader2, User } from "lucide-react";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import TextField from "~/common/components/text-field";
import { makeSSRClient, browserClient } from "~/supa-client";
import { getUserProfile } from "../queries";
import { updateUserProfile, uploadProfileImage } from "../mutations";
import { useAlert } from "~/hooks/useAlert";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/edit-profile-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { profile: null, storageImageUrl: null };
  }

  try {
    const profile = await getUserProfile(client, user.id);
    const storageImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/profiles/${user.id}`;

    return { profile, storageImageUrl };
  } catch (error) {
    console.error("Failed to load profile:", error);
    return { profile: null, storageImageUrl: null };
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const nickname = formData.get("nickname") as string;
  const introduction = formData.get("introduction") as string;
  const comment = formData.get("comment") as string;

  if (!nickname?.trim()) {
    return { success: false, error: "닉네임을 입력해주세요." };
  }

  try {
    await updateUserProfile(client, {
      userId: user.id,
      nickname: nickname.trim(),
      introduction: introduction?.trim() || undefined,
      comment: comment?.trim() || undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "프로필 수정에 실패했습니다." };
  }
};

export default function EditProfilePage() {
  const { profile, storageImageUrl } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { alert } = useAlert();
  const hasHandledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [introduction, setIntroduction] = useState(profile?.introduction ?? "");
  const [comment, setComment] = useState(profile?.comment ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const isSubmitting = fetcher.state !== "idle";

  // 클라이언트에서만 이미지 로드 시도
  useEffect(() => {
    if (storageImageUrl) {
      const img = new Image();
      img.onload = () => setImageSrc(storageImageUrl);
      img.onerror = () => {
        if (profile?.avatar) {
          const socialImg = new Image();
          socialImg.onload = () => setImageSrc(profile.avatar);
          socialImg.onerror = () => setImageSrc(null);
          socialImg.src = profile.avatar;
        } else {
          setImageSrc(null);
        }
      };
      img.src = storageImageUrl;
    }
  }, [storageImageUrl, profile?.avatar]);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !storageImageUrl) return;

    setIsUploading(true);
    try {
      await uploadProfileImage(browserClient, profile.id, file);
      // 캐시 무효화를 위해 timestamp 추가
      setImageSrc(`${storageImageUrl}?t=${Date.now()}`);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert({
        title: "오류",
        message: "이미지 업로드에 실패했습니다.",
        primaryButton: { label: "확인" },
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 결과 처리
  useEffect(() => {
    if (fetcher.data && !hasHandledRef.current) {
      hasHandledRef.current = true;
      if (fetcher.data.success) {
        alert({
          title: "알림",
          message: "프로필이 수정되었습니다.",
          primaryButton: {
            label: "확인",
            onClick: () => navigate(-1),
          },
        });
      } else {
        alert({
          title: "오류",
          message: fetcher.data.error ?? "프로필 수정에 실패했습니다.",
          primaryButton: { label: "확인" },
        });
        hasHandledRef.current = false;
      }
    }
  }, [fetcher.data]);

  const handleSubmit = () => {
    hasHandledRef.current = false;
    fetcher.submit(
      {
        nickname,
        introduction,
        comment,
      },
      { method: "POST" }
    );
  };

  if (!profile) {
    return (
      <Content headerPorps={{ title: "프로필 수정", useRight: false }}>
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">로그인이 필요합니다.</span>
        </div>
      </Content>
    );
  }

  return (
    <Content
      headerPorps={{ title: "프로필 수정", useRight: false }}
      footer={
        <Button
          variant="secondary"
          className="flex w-full h-12.5 rounded-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !nickname.trim()}
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </Button>
      }
    >
      <div className="flex flex-col w-full">
        {/* 프로필 이미지 */}
        <div className="flex justify-center py-6">
          <div className="relative">
            <div
              className={cn(
                "w-28 h-28 rounded-full overflow-hidden",
                "bg-gray-200 flex items-center justify-center"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            {/* 카메라 아이콘 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "absolute bottom-0 right-0",
                "w-8 h-8 rounded-full",
                "bg-white border border-gray-200 shadow-sm",
                "flex items-center justify-center",
                "disabled:opacity-50"
              )}
            >
              <Camera className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 닉네임 */}
        <TextField
          id="nickname"
          label="닉네임"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력해주세요"
        />

        {/* 한줄소개 */}
        <TextField
          id="introduction"
          label="한줄소개"
          type="text"
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          placeholder="한줄소개를 입력해주세요"
        />

        {/* 기타 메세지 */}
        <TextField
          id="comment"
          label="기타 메세지"
          multiline
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="기타 메세지를 입력해주세요"
        />
      </div>
    </Content>
  );
}

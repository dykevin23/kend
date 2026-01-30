import { useRef, useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import Camera from "~/assets/images/camera";
import Content from "~/common/components/content";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import DatePicker from "~/common/components/date-picker";
import { makeSSRClient } from "~/supa-client";
import {
  updateChild,
  deleteChild,
  uploadChildProfileImage,
} from "../mutations";
import { getChildByCode } from "../queries";
import type { Route } from "./+types/edit-child-page";
import { Button } from "~/common/components/ui/button";
import { Trash2 } from "lucide-react";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { childId } = params;
  const childCode = parseInt(childId, 10);

  if (isNaN(childCode)) {
    throw new Response("잘못된 요청입니다.", { status: 400 });
  }

  const child = await getChildByCode(client, user.id, childCode);

  if (!child) {
    throw new Response("자녀를 찾을 수 없습니다.", { status: 404 });
  }

  // 프로필 이미지 URL
  const storageImageUrl = child.profileImageUrl
    ? child.profileImageUrl
    : `${process.env.SUPABASE_URL}/storage/v1/object/public/profiles/${user.id}/${child.id}`;

  return { child, storageImageUrl, userId: user.id };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const intent = formData.get("intent") as string;
  const { childId } = params;
  const childCode = parseInt(childId, 10);

  // 자녀 정보 조회
  const child = await getChildByCode(client, user.id, childCode);
  if (!child) {
    return { error: "자녀를 찾을 수 없습니다." };
  }

  // 삭제 처리
  if (intent === "delete") {
    try {
      await deleteChild(client, child.id);
      return redirect("/children");
    } catch (error) {
      console.error("Failed to delete child:", error);
      return { error: "자녀 삭제에 실패했습니다." };
    }
  }

  // 수정 처리
  const nickname = formData.get("nickname") as string;
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as "boy" | "girl" | null;
  const birthDate = formData.get("birthDate") as string;
  const profileImage = formData.get("profileImage") as File | null;

  if (!nickname || !birthDate) {
    return { error: "닉네임과 생년월일은 필수 입력 항목입니다." };
  }

  try {
    // 자녀 정보 수정
    await updateChild(client, {
      childId: child.id,
      nickname,
      name: name || undefined,
      gender: gender || undefined,
      birthDate,
    });

    // 프로필 이미지 업로드
    if (profileImage && profileImage.size > 0) {
      await uploadChildProfileImage(client, user.id, child.id, profileImage);
    }

    return redirect(`/children/${childCode}`);
  } catch (error) {
    console.error("Failed to update child:", error);
    return { error: "자녀 정보 수정에 실패했습니다." };
  }
};

export default function EditChildPage() {
  const { child, storageImageUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 폼 상태 (기존 값으로 초기화)
  const [gender, setGender] = useState<string>(child.gender || "");
  const [birthDate, setBirthDate] = useState<string>(child.birthDate);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // 현재 표시할 이미지
  const displayImageUrl = previewUrl || storageImageUrl;

  return (
    <Content headerPorps={{ title: "자녀 정보 수정", useRight: false }}>
      <Form method="post" encType="multipart/form-data">
        {/* 프로필 이미지 */}
        <div className="flex py-6 justify-center items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="size-26 shrink-0 aspect-square rounded-full relative"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-muted">
              <img
                src={displayImageUrl}
                alt={child.nickname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="absolute -right-0.5 -bottom-0.5 flex size-7 p-1 justify-center items-center shrink-0 aspect-square rounded-full bg-white border border-muted/30">
              <Camera />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex w-full flex-col items-start">
          {/* 에러 메시지 */}
          {actionData?.error && (
            <div className="px-4 py-2 w-full">
              <p className="text-sm text-red-500">{actionData.error}</p>
            </div>
          )}

          {/* 출생 정보 섹션 */}
          <div className="flex flex-col p-4 justify-center items-start gap-4 self-stretch">
            <div className="flex px-1 items-center gap-2.5 self-stretch">
              <span className="text-base leading-[100%]">출생 정보</span>
            </div>

            {/* 성별 선택 */}
            <Select
              value={gender}
              options={[
                { label: "남자아이", value: "boy" },
                { label: "여자아이", value: "girl" },
              ]}
              placeholder="성별을 선택해주세요"
              onChange={(v) => setGender(v)}
            />
            <input type="hidden" name="gender" value={gender} />

            {/* 생년월일 */}
            <DatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="생년월일을 선택해주세요"
              maxDate={new Date()}
            />
            <input type="hidden" name="birthDate" value={birthDate} />
          </div>

          {/* 기본 정보 */}
          <TextField
            id="nickname"
            name="nickname"
            label="자녀 닉네임"
            placeholder="닉네임을 입력해주세요"
            defaultValue={child.nickname}
            required
          />
          <TextField
            id="name"
            name="name"
            label="자녀 이름"
            placeholder="이름을 입력해주세요 (선택)"
            defaultValue={child.name || ""}
          />
        </div>

        {/* 저장 버튼 */}
        <div className="p-4 pb-4">
          <Button
            type="submit"
            name="intent"
            value="update"
            variant="secondary"
            disabled={isSubmitting}
            className="w-full py-6 rounded-full"
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </div>

        {/* 삭제 버튼 */}
        <div className="px-4 pb-8">
          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-6 rounded-full text-red-500 border-red-500 hover:bg-red-50"
            >
              <Trash2 size={18} />
              자녀 삭제
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-center text-muted-foreground mb-2">
                정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-5 rounded-full"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="delete"
                  variant="destructive"
                  disabled={isSubmitting}
                  className="flex-1 py-5 rounded-full"
                >
                  {isSubmitting ? "삭제 중..." : "삭제"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Form>
    </Content>
  );
}

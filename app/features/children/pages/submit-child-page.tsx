import { useRef, useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import Camera from "~/assets/images/camera";
import ProfileIcon from "~/assets/images/profile-icon";
import Content from "~/common/components/content";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import DatePicker from "~/common/components/date-picker";
import { makeSSRClient } from "~/supa-client";
import {
  createChild,
  createGrowthRecord,
  uploadChildProfileImage,
} from "../mutations";
import type { Route } from "./+types/submit-child-page";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 자녀 정보
  const nickname = formData.get("nickname") as string;
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as "boy" | "girl" | null;
  const birthDate = formData.get("birthDate") as string;
  const profileImage = formData.get("profileImage") as File | null;

  // 성장 데이터
  const measuredAt = formData.get("measuredAt") as string;
  const height = formData.get("height") as string;
  const weight = formData.get("weight") as string;
  const footSize = formData.get("footSize") as string;
  const headCircumference = formData.get("headCircumference") as string;

  // 유효성 검사
  if (!nickname || !birthDate) {
    return { error: "닉네임과 생년월일은 필수 입력 항목입니다." };
  }

  try {
    // 자녀 생성
    const child = await createChild(client, {
      userId: user.id,
      nickname,
      name: name || undefined,
      gender: gender || undefined,
      birthDate,
    });

    // 프로필 이미지 업로드
    if (profileImage && profileImage.size > 0) {
      await uploadChildProfileImage(client, user.id, child.id, profileImage);
    }

    // 성장 데이터가 있으면 함께 저장
    const hasGrowthData = height || weight || footSize || headCircumference;
    if (hasGrowthData && measuredAt) {
      await createGrowthRecord(client, {
        childId: child.id,
        measuredAt,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        footSize: footSize ? parseFloat(footSize) : undefined,
        headCircumference: headCircumference
          ? parseFloat(headCircumference)
          : undefined,
      });
    }

    return redirect(`/children/${child.code}`);
  } catch (error) {
    console.error("Failed to create child:", error);
    return { error: "자녀 등록에 실패했습니다. 다시 시도해주세요." };
  }
};

export default function SubmitChildPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 폼 상태
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [measuredAt, setMeasuredAt] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 오늘 날짜인지 확인
  const isToday = measuredAt === format(new Date(), "yyyy-MM-dd");

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <Content headerPorps={{ title: "아이 추가하기", useRight: false }}>
      <Form method="post" encType="multipart/form-data">
        {/* 프로필 이미지 */}
        <div className="flex py-6 justify-center items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="size-26 shrink-0 aspect-square rounded-full relative"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-muted">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="프로필 미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProfileIcon />
              )}
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

            {/* 생년월일 - DatePicker 사용 */}
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
            required
          />
          <TextField
            id="name"
            name="name"
            label="자녀 이름"
            placeholder="이름을 입력해주세요 (선택)"
          />

          {/* 성장 데이터 섹션 */}
          <div className="flex flex-col p-4 justify-center items-start gap-4 self-stretch border-t border-muted/20 mt-4">
            <div className="flex px-1 items-center justify-between self-stretch">
              <span className="text-base leading-[100%]">성장 데이터 (선택)</span>
            </div>

            {/* 측정일 선택 */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isToday ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMeasuredAt(format(new Date(), "yyyy-MM-dd"))}
                  className="rounded-full"
                >
                  오늘
                </Button>
                <span className="text-sm text-muted-foreground">또는</span>
                <div className="flex-1">
                  <DatePicker
                    value={measuredAt}
                    onChange={setMeasuredAt}
                    placeholder="다른 날짜 선택"
                    maxDate={new Date()}
                  />
                </div>
              </div>
            </div>
            <input type="hidden" name="measuredAt" value={measuredAt} />

            {/* 성장 데이터 입력 필드들 */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <GrowthInput
                name="height"
                label="신장"
                unit="cm"
                placeholder="100.0"
              />
              <GrowthInput
                name="weight"
                label="체중"
                unit="kg"
                placeholder="15.0"
              />
              <GrowthInput
                name="footSize"
                label="발사이즈"
                unit="mm"
                placeholder="150"
              />
              <GrowthInput
                name="headCircumference"
                label="머리둘레"
                unit="cm"
                placeholder="48.0"
              />
            </div>

            <p className="text-xs text-muted-foreground px-1">
              성장 데이터는 나중에 언제든지 추가할 수 있어요.
            </p>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="p-4 pb-8">
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            className="w-full py-6 rounded-full"
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </Form>
    </Content>
  );
}

/**
 * 성장 데이터 입력 컴포넌트
 */
function GrowthInput({
  name,
  label,
  unit,
  placeholder,
}: {
  name: string;
  label: string;
  unit: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          name={name}
          step="0.1"
          placeholder={placeholder}
          className={cn(
            "h-12 pr-12 rounded-xl text-right",
            "border-muted/30",
            "focus-visible:border-secondary focus-visible:ring-0"
          )}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

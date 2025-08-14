import { useState } from "react";
import { Form, redirect } from "react-router";
import BottomFloatingArea from "~/common/components/bottom-floating-area";
import CalendarSheet from "~/common/components/calendar-sheet";
import InputPair from "~/common/components/input-pair";
import { ProfileInput } from "~/common/components/profile-input";
import SelectPair from "~/common/components/select-pair";
import SubHeader from "~/common/components/sub-header";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-child-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { z } from "zod";
import { createChild } from "../mutations";

const formSchema = z.object({
  gender: z.enum(["male", "female"]),
  birthday: z.string(),
  nickname: z.string(),
  name: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();

  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const { birthday, gender, name, nickname } = data;
  const {
    data: { child_id },
  } = await createChild(client, {
    birthday,
    gender,
    name,
    nickname,
    parent_id: userId,
  });

  return redirect(`/children/${child_id}`);
};

export default function SubmitChildPage() {
  const [gender, setGender] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  return (
    <div>
      <SubHeader title="아이 추가하기" />
      <Form method="post">
        <div className="flex justify-center items-center py-10">
          <div className="size-26 flex-shrink-0 aspect-square rounded-full relative">
            <ProfileInput />
          </div>
        </div>

        <div className="flex flex-col w-full justify-center items-start p-4 gap-2 self-stretch">
          <SelectPair
            label="출생정보"
            value={gender}
            options={[
              { label: "남아", value: "male" },
              { label: "여아", value: "female" },
            ]}
            placeholder="성별을 선택해주세요."
            onChange={(v) => setGender(v)}
          />
          <CalendarSheet
            placeholder="출생연도를 입력해주세요."
            value={birthday}
            onChange={(v) => setBirthday(v)}
          />
        </div>
        <InputPair
          label="자녀 닉네임"
          name="nickname"
          placeholder="닉네임을 입력해주세요."
        />
        <InputPair
          label="자녀 이름"
          name="name"
          placeholder="이름을 입력해주세요."
        />
        <input name="gender" className="hidden" value={gender} readOnly />
        <input name="birthday" className="hidden" value={birthday} readOnly />

        <BottomFloatingArea>
          <Button
            type="submit"
            className="flex w-full h-full rounded-full text-secondary"
          >
            저장하기
          </Button>
        </BottomFloatingArea>
      </Form>
    </div>
  );
}

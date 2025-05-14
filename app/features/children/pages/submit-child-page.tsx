import { useState } from "react";
import { Form } from "react-router";
import BottomFloatingArea from "~/common/components/bottom-floating-area";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import SelectSheet from "~/common/components/select-sheet";
import SubHeader from "~/common/components/sub-header";
import { Button } from "~/common/components/ui/button";

export default function SubmitChildPage() {
  const [sex, setSex] = useState<string>("");
  return (
    <div>
      <SubHeader title="아이 추가하기" />
      <Form>
        <div className="flex flex-col w-full justify-center items-start p-4 gap-2 self-stretch">
          <SelectPair
            label="출생정보"
            value={sex}
            options={[
              { label: "남아", value: "boy" },
              { label: "여아", value: "girl" },
            ]}
            placeholder="성별을 선택해주세요."
            onChange={(v) => setSex(v)}
          />
          <SelectSheet
            value={sex}
            options={[
              { label: "남아", value: "boy" },
              { label: "여아", value: "girl" },
            ]}
            placeholder="성별을 선택해주세요."
            onChange={(v) => setSex(v)}
          />
          <div className="flex items-start gap-2 self-stretch">
            <SelectSheet
              value={sex}
              options={[
                { label: "남아", value: "boy" },
                { label: "여아", value: "girl" },
              ]}
              placeholder="성별을 선택해주세요."
              onChange={(v) => setSex(v)}
            />
            <SelectSheet
              value={sex}
              options={[
                { label: "남아", value: "boy" },
                { label: "여아", value: "girl" },
              ]}
              placeholder="성별을 선택해주세요."
              onChange={(v) => setSex(v)}
            />
          </div>
        </div>
        <InputPair label="자녀 닉네임" placeholder="닉네임을 입력해주세요." />
        <InputPair label="자녀 이름" placeholder="이름을 입력해주세요." />

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

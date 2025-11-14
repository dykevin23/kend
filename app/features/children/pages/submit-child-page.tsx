import { useState } from "react";
import Camera from "~/assets/images/camera";
import ProfileIcon from "~/assets/images/profile-icon";
import Content from "~/common/components/content";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";

export default function SubmitChildPage() {
  const [gender, setGender] = useState<string>("");

  return (
    <Content headerPorps={{ title: "아이 추가하기", useRight: false }}>
      <div className="flex py-6 justify-center items-center">
        <div className="size-26 shrink-0 aspect-square rounded-full relative">
          <ProfileIcon />
          <div className="absolute right-1 bottom-1 flex size-7 p-1 justify-center items-center shrink-0 aspect-square rounded-full bg-white border-1 border-muted/30">
            <Camera />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start">
        {/* 출생정보 start */}
        <div className="flex flex-col p-4 justify-center items-start gap-2 self-stretch">
          <div className="flex px-1 items-center gap-2.5 self-stretch">
            <span className="text-base leading-[100%]">출생 정보</span>
          </div>
          <Select
            value={gender}
            options={[
              { label: "남자아이", value: "male" },
              { label: "여자아이", value: "female" },
            ]}
            placeholder="성별을 선택해주세요"
            onChange={(v) => setGender(v)}
          />
          {/* <Select placeholder="출생연도를 입력해주세요" /> */}
        </div>
        {/* 출생정보 end */}

        <TextField id="nickname" label="닉네임" />
        <TextField id="name" label="이름" />
      </div>
    </Content>
  );
}

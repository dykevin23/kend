import InputPair from "~/common/components/input-pair";
import SubHeader from "~/common/components/sub-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";

export default function ModifyProfilePage() {
  return (
    <div>
      <SubHeader title="프로필 수정" />

      <div className="flex justify-center items-center py-6">
        <div className="size-26">
          <Avatar className="size-26 shrink-0 aspect-square rounded-full border-1 bg-muted-foreground">
            <AvatarFallback>N</AvatarFallback>
            <AvatarImage src="https://github.com/facebook.png" />
          </Avatar>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4 pb-6">
        <InputPair label="닉네임" id="nickname" name="nickname" />

        <InputPair label="한줄소개" id="description" name="description" />

        <InputPair label="기타 메세지" id="etc" name="etc" textArea />
      </div>

      <div className="flex w-full flex-col items-start">
        <div className="flex h-18 py-2 px-4 justify-center items-center gap-4 self-stretch border-t-1">
          <Button className="flex h-full px-4 justify-center items-center gap-2.5 grow shrink-0 basis-0 self-stretch rounded-full font-semibold">
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}

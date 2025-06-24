import { ImagePlus } from "lucide-react";
import { Form } from "react-router";
import InputPair from "~/common/components/input-pair";
import SubHeader from "~/common/components/sub-header";
import { Button } from "~/common/components/ui/button";

export default function SubmitPage() {
  return (
    <div>
      <SubHeader
        rightComponent={
          <div className="flex h-9 py-3 justify-center items-center gap-2.5">
            <Button variant="destructive" disabled>
              임시저장
            </Button>
          </div>
        }
      />

      {/* 이미지 업로드 영역 start */}
      <div className="flex py-4 pl-4 items-center gap-2.5 shrink-0">
        <div className="flex size-18 p-2 flex-col justify-center items-center gap-1 shrink-0 rounded-xl border-solid border-1">
          <ImagePlus className="size-8 shrink-0 aspect-square" />
          <div className="flex py-1 px-2 justify-center items-center gap-2.5 bg-muted-foreground/20 rounded-full">
            <span className="text-[10px] font-medium leading-2.75 -tracking-[0.4px] text-muted-foreground/50">
              <span className="text-black">8</span> / 10
            </span>
          </div>
        </div>
        <div className="flex grow shrink-0 basis-0 items-start gap-2.5 overflow-x-scroll">
          <div className="flex items-center space-x-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="size-18 rounded-xl bg-primary/50"></div>
            ))}
          </div>
        </div>
      </div>
      {/* 이미지 업로드 영역 end */}

      <div className="flex pb-4 flex-col items-start gap-4">
        <Form className="max-w-screen w-full">
          <InputPair
            label="제목"
            id="title"
            name="title"
            placeholder="제목을 입력해주세요."
          />
          <InputPair
            label="금액"
            id="price"
            name="price"
            placeholder="가격을 입력해주세요."
          />
          <InputPair
            label="설명"
            id="description"
            name="description"
            textArea
            placeholder={`판매하는 제품의 설명을 작성해주세요.\n(판매를 금지하는 물품은 게시 후 삭제 될 수 있습니다.)\n\n우리 아이만을 위한 거래를 시작하세요.`}
          />
          <InputPair
            label="해시태그"
            id="hashtag"
            name="hashtag"
            placeholder="#해시태그를 입력해주세요."
          />
        </Form>
      </div>
      {/* Floating Area */}
      <div className="flex w-full flex-col">
        <div className="flex h-18 px-4 py-2 justify-center items-center gap-4 border-t-1 border-solid border-muted-foreground/10">
          <div className="flex px-4 justify-center items-center grow shrink-0 basis-0 self-stretch gap-2.5">
            <Button className="text-secondary text-sm font-semibold leading-3.5 rounded-full">
              게시글 올리기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

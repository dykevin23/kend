import { cn } from "~/lib/utils";

export default function StoreCategoryTab() {
  return (
    <div className="flex flex-col w-full items-start">
      <div className="flex w-full items-center">
        <div
          className={cn(
            "flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0",
            "border-b-2 border-b-secondary"
          )}
        >
          <span className="text-base leading-4 tracking-[-0.4px]">홈</span>
        </div>
        <div className="flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0">
          <span className="text-base leading-4 tracking-[-0.4px]">패션</span>
        </div>
        <div className="flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0">
          <span className="text-base leading-4 tracking-[-0.4px]">
            스킨케어
          </span>
        </div>
        <div className="flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0">
          <span className="text-base leading-4 tracking-[-0.4px]">
            액티비티
          </span>
        </div>
        <div className="flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0">
          <span className="text-base leading-4 tracking-[-0.4px]">라이프</span>
        </div>
      </div>
    </div>
  );
}

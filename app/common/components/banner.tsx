import { cn } from "~/lib/utils";

export default function Banner() {
  return (
    <div className="flex w-full h-36 px-4 flex-col items-start gap-2.5">
      <div
        className={cn(
          "flex justify-end items-center w-full h-full",
          "bg-muted/30 rounded-2xl"
        )}
      ></div>
    </div>
  );
}

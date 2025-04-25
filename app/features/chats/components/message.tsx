import { cn } from "~/lib/utils";

interface MessageProps {
  message: string;
  reverse?: boolean;
  postedAt: string;
}

export default function Message({
  message,
  reverse = false,
  postedAt,
}: MessageProps) {
  return (
    <div
      className={cn([
        "flex justify-end items-end gap-2 self-stretch",
        reverse && "flex-row-reverse",
      ])}
    >
      <span className="text-xs leading-3 text-right text-muted-foreground">
        {postedAt}
      </span>
      <div className="flex flex-col justify-center items-end gap-1 max-w-68">
        <div
          className={cn([
            "flex py-2.5 px-4 justify-end items-center gap-2.5  rounded-b-[17px] ",
            reverse
              ? "rounded-tr-[17px] rounded-tl-[3px] bg-accent"
              : "rounded-tl-[17px] rounded-tr-[3px] bg-primary",
          ])}
        >
          <span
            className={cn([
              "text-sm leading-5.5",
              reverse ? "text-black" : "text-white",
            ])}
          >
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}

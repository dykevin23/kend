import { useEffect, useState } from "react";
import { Form, useNavigation } from "react-router";
import BottomSheet from "~/common/components/bottom-sheet";
import DatePicker from "~/common/components/date-picker";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

interface GrowthInputSheetProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  childId: string;
  childNickname: string;
}

export default function GrowthInputSheet({
  open,
  setOpen,
  childId,
  childNickname,
}: GrowthInputSheetProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [measuredAt, setMeasuredAt] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  // 시트가 열릴 때 날짜를 오늘로 초기화
  useEffect(() => {
    if (open) {
      setMeasuredAt(format(new Date(), "yyyy-MM-dd"));
    }
  }, [open]);

  const isToday = measuredAt === format(new Date(), "yyyy-MM-dd");

  return (
    <BottomSheet open={open} setOpen={setOpen}>
      <div className="w-full">
        <h2 className="text-xl font-bold pt-2 pb-6">{childNickname}의 성장 데이터</h2>

        <Form method="post" onSubmit={() => setTimeout(() => setOpen(false), 100)}>
          <input type="hidden" name="intent" value="addGrowth" />
          <input type="hidden" name="childId" value={childId} />
          <input type="hidden" name="measuredAt" value={measuredAt} />

          {/* 측정일 선택 */}
          <div className="flex flex-col gap-2 mb-4">
            <Label className="text-muted-foreground">측정일</Label>
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

          {/* 성장 데이터 입력 필드들 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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

          <p className="text-xs text-muted-foreground mb-4">
            변경된 항목만 입력하면 됩니다.
          </p>

          {/* 저장 버튼 */}
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            className="w-full py-6 rounded-full"
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </Form>
      </div>
    </BottomSheet>
  );
}

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

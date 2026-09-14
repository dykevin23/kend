import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "~/lib/utils";

interface SelectOptionProps {
  label: string | React.ReactNode;
  value: string;
  disabled?: boolean;
}

interface AccordionItemProps {
  triggerLabel: string | React.ReactNode;
  value: string;
  options: SelectOptionProps[];
}

interface SelectAccordionProps {
  items: AccordionItemProps[];
  values: { [key: string]: string };
  onChange: (value: string, parent: string) => void;
}

export const SelectAccordion = ({
  items,
  values,
  onChange,
}: SelectAccordionProps) => {
  const [accordionValues, setAccordionValues] = useState<string[]>([]);

  const handleClick =
    (value: string, parent: string, disabled?: boolean) =>
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      onChange(value, parent);

      setAccordionValues((prev) => prev.filter((v) => v !== parent));
    };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={accordionValues}
      onValueChange={setAccordionValues}
    >
      {items.map((item: AccordionItemProps) => (
        <AccordionItem value={item.value} key={item.value}>
          <AccordionTrigger>
            {values[item.value]
              ? item.options.find(
                  (option: SelectOptionProps) =>
                    option.value === values[item.value]
                )?.label
              : item.triggerLabel}
          </AccordionTrigger>
          <AccordionContent>
            {item.options.map((option: SelectOptionProps) => (
              <div
                key={option.value}
                className={cn(
                  "flex h-14 py-2.5 px-4 items-center gap-2.5 self-stretch",
                  option.disabled && "text-muted opacity-50 cursor-not-allowed"
                )}
                onClick={handleClick(option.value, item.value, option.disabled)}
              >
                {option.label}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

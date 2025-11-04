import { Button } from "~/common/components/ui/button";
import DeliveryAddressAddModal from "./delivery-address-add-modal";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Badge } from "~/common/components/ui/badge";
import { Dot } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";

interface AddressProps {}

interface DeliveryAddressProps {
  address: AddressProps | null;
}

export default function DeliveryAddress({ address }: DeliveryAddressProps) {
  const [addressAddModalOpen, setAddressAddModalOpen] =
    useState<boolean>(false);

  const handleDeliveryAddress = () => {
    /* 주소 관리 모달 필요 */
  };

  return (
    <>
      <div className="flex w-full p-4 h-66 flex-col items-start gap-2.5 shrink-0 bg-white border-b-4 border-b-muted/10">
        <div
          className={cn(
            "flex h-12 p-4 items-center gap-2 shrink-0 self-stretch",
            { "justify-between": address }
          )}
        >
          <span className="text-lg font-bold leading-4.5 tracking-[-0.4px]">
            배송주소
          </span>
          {address && (
            <div
              className="flex justify-end items-center"
              onClick={handleDeliveryAddress}
            >
              <span className="text-xs leading-4">배송 주소 변경</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M6 4L10 8L6 12" stroke="#163E64" />
              </svg>
            </div>
          )}
        </div>
        {address ? (
          <div className="flex h-45 py-5 px-4 flex-col items-start gap-4 self-stretch rounded-lg border-1 border-muted/10">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold leading-4 tracking-[-0.4px]">
                집
              </span>
              <Badge>기본 배송 주소지</Badge>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm leading-3.5 tracking-[-0.4px]">
                이경근
              </span>
              <Dot className="size-4" />
              <span className="text-sm leading-3.5 tracking-[-0.4px]">
                010-6515-6038 
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm leading-3.5 tracking-[-0.4px]">
                서울시 서초구 명달로 122-12 (서초동, 코지밸리 비), 502호 [06658]
              </span>
            </div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="배송 메세지를 선택해주세요." />
              </SelectTrigger>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col h-30 px-4 justify-center items-center gap-5 shrink-0 self-stretch rounded-md border-1">
            <span className="text-sm leading-3.5 tracking-[-0.4px]">
              등록된 배송 주소가 없습니다.
            </span>
            <Button
              variant="secondary"
              onClick={() => setAddressAddModalOpen(true)}
            >
              배송 주소 추가
            </Button>
          </div>
        )}
      </div>

      <DeliveryAddressAddModal
        open={addressAddModalOpen}
        onClose={() => setAddressAddModalOpen(false)}
      />
    </>
  );
}

import InputWithLabel from "~/common/components/input-with-label";
import Modal from "~/common/components/modal";
import DaumPostCodeModal from "~/common/components/daum-post-code-modal";

interface DeliveryAddressAddModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeliveryAddressAddModal({
  open,
  onClose,
}: DeliveryAddressAddModalProps) {
  return (
    <Modal open={open} title="배송 주소 추가" onClose={onClose}>
      <div className="flex w-full pt-7.5 flex-col items-start shrink-0">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full px-4 items-start gap-1">
            <InputWithLabel
              label="우편번호"
              placeholder="우편번호를 입력해주세요."
            />
            <DaumPostCodeModal onComplete={() => {}} />
          </div>
          <InputWithLabel label="주소" placeholder="주소를 입력해주세요." />
          <InputWithLabel
            label="상세주소"
            placeholder="상세주소를 입력해주세요."
          />
          <InputWithLabel
            label="주소명"
            placeholder="집, 회사 등 주소명을 입력해주세요."
          />
          <InputWithLabel label="수령인" placeholder="이름을 입력해주세요." />
          <InputWithLabel label="휴대폰" placeholder="숫자만 입력해주세요." />
        </div>
      </div>
    </Modal>
  );
}

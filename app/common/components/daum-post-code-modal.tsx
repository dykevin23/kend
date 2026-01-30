import { useState } from "react";
import { Button } from "./ui/button";
import Modal from "./modal";
import DaumPostcode from "react-daum-postcode";

interface DaumPostCodeModalProps {
  onComplete: (data: { zoneCode: string; address: string }) => void;
}

export default function DaumPostCodeModal({
  onComplete,
}: DaumPostCodeModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleComplete = (data: { zonecode: string; address: string }) => {
    onComplete({
      zoneCode: data.zonecode,
      address: data.address,
    });
    setOpen(false);
  };

  return (
    <>
      <Button type="button" className="rounded-2xl" onClick={() => setOpen(true)}>
        우편번호 찾기
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="우편 번호 찾기">
        <DaumPostcode onComplete={handleComplete} />
      </Modal>
    </>
  );
}

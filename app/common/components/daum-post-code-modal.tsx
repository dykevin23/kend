import { useState } from "react";
import { Button } from "./ui/button";
import Modal from "./modal";
import DaumPostcode from "react-daum-postcode";

interface DaumPostCodeModalProps {
  onComplete: () => void;
}

export default function DaumPostCodeModal({
  onComplete,
}: DaumPostCodeModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleComplete = (data: any) => {
    console.log("### handleComplete => ", data);
  };

  return (
    <>
      <Button className="rounded-2xl" onClick={() => setOpen(true)}>
        우편번호 찾기
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="우편 번호 찾기">
        <DaumPostcode onComplete={handleComplete} />
      </Modal>
    </>
  );
}

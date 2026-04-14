import { Link } from "react-router";
import Apple from "~/assets/icons/apple";
import Google from "~/assets/icons/google";
import Kakao from "~/assets/icons/kakao";
import Naver from "~/assets/icons/naver";
import { useAlert } from "~/hooks/useAlert";

export default function SocialButtons() {
  const { alert } = useAlert();

  const handleAppleClick = () => {
    alert({
      title: "준비중",
      message: "Apple 로그인은 현재 준비중입니다.",
      primaryButton: { label: "확인", onClick: () => {} },
    });
  };

  return (
    <div className="flex px-6 justify-between items-center self-stretch">
      <Link to="/auth/naver/start">
        <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
          <Naver />
        </div>
      </Link>
      <Link to="/auth/social/kakao/start">
        <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
          <Kakao />
        </div>
      </Link>
      <button
        type="button"
        onClick={handleAppleClick}
        className="flex size-13.5 justify-center items-center rounded-full bg-white"
      >
        <Apple />
      </button>
      <Link to="/auth/social/google/start">
        <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
          <Google />
        </div>
      </Link>
    </div>
  );
}

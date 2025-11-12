import { Link } from "react-router";
import Apple from "~/assets/icons/apple";
import Google from "~/assets/icons/google";
import Kakao from "~/assets/icons/kakao";
import Naver from "~/assets/icons/naver";

export default function SocialButtons() {
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
      <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
        <Apple />
      </div>
      <Link to="/auth/social/google/start">
        <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
          <Google />
        </div>
      </Link>
    </div>
  );
}

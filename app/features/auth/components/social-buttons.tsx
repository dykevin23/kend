import Apple from "~/assets/icons/apple";
import Google from "~/assets/icons/google";
import Kakao from "~/assets/icons/kakao";
import Naver from "~/assets/icons/naver";

export default function SocialButtons() {
  return (
    <div className="flex px-6 justify-between items-center self-stretch">
      <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
        <Naver />
      </div>
      <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
        <Kakao />
      </div>
      <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
        <Apple />
      </div>
      <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
        <Google />
      </div>
    </div>
  );
}

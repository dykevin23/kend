import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

export interface HeaderProps {
  title?: string;
  useRight?: boolean;
}

export default function Header({ title, useRight = true }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const naviMenus = ["/stores", "/children", "/chats", "/users"];

  const [isNaviMenu] = useState<boolean>(
    naviMenus.includes(pathname) ||
      !isNaN(Number(pathname.split("/children/").at(-1)))
  );

  return (
    <div className="flex p-4 justify-between items-center self-stretch">
      {!isNaviMenu && <ArrowLeft onClick={() => navigate(-1)} />}
      {isNaviMenu ? (
        <span className="text-2xl leading-6 tracking-[-0.4px]">{title}</span>
      ) : title ? (
        <span className="text-center text-base font-bold leading-4 tracking-[-0.4px]">
          {title}
        </span>
      ) : null}
      {useRight ? (
        <div className="flex items-center gap-6">
          <Link to="/search">
            <Search className="size-7" />
          </Link>
          <Link to="/carts">
            <ShoppingBag className="size-7" />
          </Link>
        </div>
      ) : (
        <div className="size-6" />
      )}
    </div>
  );
}

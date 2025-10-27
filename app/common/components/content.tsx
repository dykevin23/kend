import type { HeaderProps } from "./header";
import Header from "./header";

interface ContentProps {
  children: React.ReactNode;
  headerPorps?: HeaderProps;
}

export default function Content({ children, headerPorps }: ContentProps) {
  return (
    <div>
      <Header {...headerPorps} />
      {children}
    </div>
  );
}

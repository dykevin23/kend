interface BottomButtonAreaProps {
  children: React.ReactNode;
}

export default function BottomButtonArea({ children }: BottomButtonAreaProps) {
  return (
    <div className="flex w-full h-18 p-4 fixed bottom-0 justify-center items-center gap-1.5 shrink-0 border-t-1 border-t-muted/10 bg-white">
      {children}
    </div>
  );
}

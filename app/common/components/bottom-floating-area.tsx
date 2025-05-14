export default function BottomFloatingArea({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full fixed bottom-0 border-t border-t-muted-foreground/10">
      <div className="flex h-18 py-2 px-4 justify-center items-center gap-4 self-stretch">
        <div className="flex justify-center items-center gap-2.5 grow shrink-0 basis-0 self-stretch">
          {children}
        </div>
      </div>
      <div className="flex h-8.5" />
    </div>
  );
}

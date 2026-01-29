import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export interface AlertProps {
  open: boolean;
  title: string;
  message: string;
  primaryButton: { label: string; onClick?: () => void };
  secondaryButton?: { label: string; onClick?: () => void };
  [key: string]: any;
}

export default function Alert({
  open,
  title,
  message,
  primaryButton,
  secondaryButton,
}: AlertProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="flex flex-col gap-4 p-6 rounded-xl max-w-80">
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="text-base font-bold text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-muted">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3 sm:justify-center">
          {secondaryButton && (
            <AlertDialogCancel
              className="flex-1 h-10 rounded-full"
              onClick={() => secondaryButton.onClick?.()}
            >
              {secondaryButton.label}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            className="flex-1 h-10 rounded-full"
            variant="secondary"
            onClick={() => primaryButton.onClick?.()}
          >
            {primaryButton.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

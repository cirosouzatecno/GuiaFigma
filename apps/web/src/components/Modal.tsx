import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ title, open, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3"
      role="dialog"
    >
      <div
        className={cn(
          "max-h-[86vh] w-full max-w-[430px] overflow-y-auto rounded-md bg-expo-white shadow-xl",
          className
        )}
      >
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b bg-expo-white px-4 py-3">
          <h2 className="min-w-0 truncate text-lg font-bold text-primary">
            {title}
          </h2>
          <button
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

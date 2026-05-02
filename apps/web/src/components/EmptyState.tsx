import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title?: string;
  message: string;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nada por aqui",
  message,
  className
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-md border bg-expo-white px-6 py-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-primary">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </section>
  );
}

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorState({
  message = "Não foi possível carregar os dados agora.",
  onRetry
}: ErrorStateProps) {
  return (
    <section className="rounded-md border bg-expo-white p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-primary">
        Algo saiu do esperado
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-4" onClick={onRetry} type="button">
        Tentar novamente
      </Button>
    </section>
  );
}

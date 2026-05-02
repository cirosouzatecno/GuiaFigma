import React from "react";
import type { ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true
    };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-expo-gray px-6">
          <section className="w-full max-w-[430px] rounded-md border bg-expo-white p-6 text-center">
            <h1 className="text-lg font-bold text-primary">
              Algo saiu do esperado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Não foi possível carregar esta área agora. Tente novamente em
              alguns instantes.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

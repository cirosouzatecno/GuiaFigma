type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = "Carregando" }: LoadingSpinnerProps) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className="flex min-h-40 items-center justify-center"
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
}

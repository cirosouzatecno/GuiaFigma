type HeaderProps = {
  title?: string;
};

export function Header({ title = "Guia Expo Rio Preto 2026" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-expo-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-[430px] items-center gap-3 px-4 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          RP
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase text-primary-medium">
            Prefeitura SJRioPreto
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Secretaria Agricultura
          </p>
          <h1 className="truncate text-base font-bold text-primary">{title}</h1>
        </div>
      </div>
    </header>
  );
}

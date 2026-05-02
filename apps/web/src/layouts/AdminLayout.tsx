import {
  CalendarDays,
  Info,
  LayoutDashboard,
  Megaphone,
  Store
} from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const adminItems = [
  {
    to: "/admin",
    label: "Painel",
    icon: LayoutDashboard,
    end: true
  },
  {
    to: "/admin/eventos",
    label: "Eventos",
    icon: CalendarDays
  },
  {
    to: "/admin/expositores",
    label: "Expositores",
    icon: Store
  },
  {
    to: "/admin/ao-vivo",
    label: "Ao Vivo",
    icon: Megaphone
  },
  {
    to: "/admin/informacoes",
    label: "Info",
    icon: Info
  }
] as const;

export function AdminLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-expo-gray">
      <header className="sticky top-0 z-30 border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex min-h-16 w-full max-w-[430px] items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase text-primary-foreground/75">
              Admin
            </p>
            <h1 className="truncate text-base font-bold">
              Guia Expo Rio Preto
            </h1>
            <p className="truncate text-xs text-primary-foreground/75">
              {usuario?.nome ?? "Administrador"}
            </p>
          </div>
          <button
            className="shrink-0 rounded-md border border-primary-foreground/30 px-3 py-2 text-xs font-semibold text-primary-foreground"
            onClick={() => {
              void logout();
            }}
            type="button"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-expo-white/95 backdrop-blur">
        <div className="mx-auto grid h-16 w-full max-w-[430px] grid-cols-5 px-2">
          {adminItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium text-muted-foreground transition-colors",
                    isActive && "text-primary"
                  )
                }
                end={item.end}
                key={item.to}
                to={item.to}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

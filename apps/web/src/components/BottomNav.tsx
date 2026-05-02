import { CalendarDays, Home, Map, MoreHorizontal, Radio } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

const items = [
  {
    to: "/",
    label: "Home",
    icon: Home,
    end: true
  },
  {
    to: "/agenda",
    label: "Agenda",
    icon: CalendarDays
  },
  {
    to: "/mapa",
    label: "Mapa",
    icon: Map
  },
  {
    to: "/ao-vivo",
    label: "Ao Vivo",
    icon: Radio
  },
  {
    to: "/mais",
    label: "Mais",
    icon: MoreHorizontal
  }
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-expo-white/95 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-[430px] grid-cols-5 px-2">
        {items.map((item) => {
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
  );
}

import { CalendarDays, Map, Radio, Store, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { Evento } from "@/types/api";
import { formatEventoDia, isEventoAoVivo } from "@/lib/event-utils";

const quickActions = [
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
  }
] as const;

export function HomePage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get<Evento[]>("/eventos");
      setEventos(response.data);
      setActiveIndex(0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEventos();
  }, [fetchEventos]);

  useEffect(() => {
    if (eventos.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % eventos.length);
    }, 4500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [eventos.length]);

  const eventoAtivo = useMemo(
    () => eventos[activeIndex] ?? null,
    [activeIndex, eventos]
  );

  return (
    <div className="space-y-5 px-4 py-5">
      <section className="rounded-md bg-primary p-5 text-primary-foreground">
        <p className="text-xs font-semibold uppercase text-primary-foreground/75">
          Prefeitura SJRioPreto
        </p>
        <p className="mt-1 text-sm text-primary-foreground/85">
          Secretaria Agricultura
        </p>
        <h2 className="mt-3 text-2xl font-bold">Guia Expo Rio Preto 2026</h2>
      </section>

      <section aria-label="Eventos em destaque">
        {loading ? (
          <div className="rounded-md border bg-expo-white p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-4 h-8 w-4/5" />
            <Skeleton className="mt-3 h-4 w-2/3" />
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorState onRetry={fetchEventos} />
        ) : eventoAtivo ? (
          <article className="rounded-md border bg-expo-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                {formatEventoDia(eventoAtivo)} - {eventoAtivo.horario}
              </span>
              {isEventoAoVivo(eventoAtivo) ? (
                <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
                  AO VIVO
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 text-xl font-bold text-primary">
              {eventoAtivo.titulo}
            </h3>
            {eventoAtivo.subtitulo ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {eventoAtivo.subtitulo}
              </p>
            ) : null}
            <p className="mt-3 text-sm font-medium text-primary-medium">
              {eventoAtivo.local}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {eventos.map((evento, index) => (
                <button
                  aria-label={`Ir para ${evento.titulo}`}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex ? "w-6 bg-primary" : "w-2 bg-border"
                  }`}
                  key={evento.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
          </article>
        ) : (
          <EmptyState message="Nenhum evento disponível no momento." />
        )}
      </section>

      <section className="grid grid-cols-3 gap-3" aria-label="Atalhos rapidos">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Button asChild className="h-16 flex-col" key={action.to}>
              <Link to={action.to}>
                <Icon aria-hidden="true" className="h-5 w-5" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </section>

      <section className="grid gap-3">
        <Link
          className="flex items-center gap-4 rounded-md border bg-expo-white p-4 transition-colors hover:bg-secondary"
          to="/expositores"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <Store aria-hidden="true" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-primary">
              Expositores & Estandes
            </h3>
            <p className="text-sm text-muted-foreground">
              Consulte empresas, categorias e estandes.
            </p>
          </div>
        </Link>
        <Link
          className="flex items-center gap-4 rounded-md border bg-expo-white p-4 transition-colors hover:bg-secondary"
          to="/minha-agenda"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <Star aria-hidden="true" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-primary">Minha Agenda</h3>
            <p className="text-sm text-muted-foreground">
              Acesse os eventos salvos para visitar depois.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}

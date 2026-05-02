import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Modal } from "@/components/Modal";
import { CardSkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  hasEventoNaAgenda,
  toggleEventoNaAgenda
} from "@/lib/agenda-storage";
import {
  type AgendaCategoria,
  formatEventoDia,
  getEventoAgendaCategoria,
  getDateKey,
  getEventoIcon,
  normalizeText
} from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { Evento } from "@/types/api";

const dayTabs = [
  {
    label: "10/JE",
    dateKey: "todos"
  },
  {
    label: "QUI 24/09",
    dateKey: "24/09"
  },
  {
    label: "SEX 25/09",
    dateKey: "25/09"
  },
  {
    label: "SÁB 26/09",
    dateKey: "26/09"
  },
  {
    label: "DOM 27/09",
    dateKey: "27/09"
  }
] as const;

const categorias = [
  "Todas",
  "Shows",
  "Palestras",
  "Demonstrações",
  "Cerimônias"
] as const;

export function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedDay, setSelectedDay] =
    useState<(typeof dayTabs)[number]["dateKey"]>("todos");
  const [selectedCategory, setSelectedCategory] =
    useState<AgendaCategoria>("Todas");
  const [search, setSearch] = useState("");
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isSelectedSaved, setIsSelectedSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get<Evento[]>("/eventos");
      setEventos(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEventos();
  }, [fetchEventos]);

  const filteredEventos = useMemo(() => {
    const normalizedSearch = normalizeText(debouncedSearch);

    return eventos.filter((evento) => {
      const matchDay =
        selectedDay === "todos" || getDateKey(evento.dia) === selectedDay;
      const agendaCategoria = getEventoAgendaCategoria(evento);
      const matchCategory =
        selectedCategory === "Todas" ||
        agendaCategoria === selectedCategory ||
        normalizeText(evento.categoria) === normalizeText(selectedCategory);
      const searchableText = [
        evento.titulo,
        evento.subtitulo,
        evento.local,
        evento.categoria,
        evento.descricao
      ]
        .filter(Boolean)
        .join(" ");
      const matchSearch =
        normalizedSearch.length === 0 ||
        normalizeText(searchableText).includes(normalizedSearch);

      return matchDay && matchCategory && matchSearch;
    });
  }, [debouncedSearch, eventos, selectedCategory, selectedDay]);

  function openEvento(evento: Evento) {
    setSelectedEvento(evento);
    setIsSelectedSaved(hasEventoNaAgenda(evento.id));
  }

  function toggleSelectedEvento() {
    if (!selectedEvento) {
      return;
    }

    const nextSaved = toggleEventoNaAgenda(selectedEvento.id);
    setIsSelectedSaved(nextSaved);
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Agenda Completa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtre eventos por dia, categoria e termo de busca.
        </p>
      </section>

      <section className="space-y-3 rounded-md border bg-expo-white p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dayTabs.map((tab) => (
            <button
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                selectedDay === tab.dateKey
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-expo-white text-primary"
              )}
              key={tab.label}
              onClick={() => setSelectedDay(tab.dateKey)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-primary">
          Categoria
          <select
            className="mt-1 h-11 w-full rounded-md border bg-expo-white px-3 text-sm text-primary outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) =>
              setSelectedCategory(event.target.value as AgendaCategoria)
            }
            value={selectedCategory}
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        <label className="relative block">
          <span className="sr-only">Buscar evento</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="h-11 w-full rounded-md border bg-expo-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, local ou categoria"
            type="search"
            value={search}
          />
        </label>
      </section>

      {loading ? (
        <CardSkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={fetchEventos} />
      ) : filteredEventos.length === 0 ? (
        <EmptyState message="Nenhum evento encontrado com os filtros atuais." />
      ) : (
        <section className="space-y-3">
          {filteredEventos.map((evento) => {
            const Icon = getEventoIcon(evento.iconKey);

            return (
              <article
                className="rounded-md border bg-expo-white p-4 shadow-sm"
                key={evento.id}
              >
                <div className="flex gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: evento.cor }}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary">
                      {evento.horario} - {formatEventoDia(evento)}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-primary">
                      {evento.titulo}
                    </h3>
                    {evento.subtitulo ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {evento.subtitulo}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => openEvento(evento)}
                  type="button"
                  variant="outline"
                >
                  Ver detalhes
                </Button>
              </article>
            );
          })}
        </section>
      )}

      <Modal
        onClose={() => setSelectedEvento(null)}
        open={Boolean(selectedEvento)}
        title={selectedEvento?.titulo ?? "Detalhe do evento"}
      >
        {selectedEvento ? (
          <div className="space-y-4">
            <div className="rounded-md bg-secondary p-3">
              <p className="text-sm font-semibold text-primary">
                {selectedEvento.horario} - {formatEventoDia(selectedEvento)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedEvento.local}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-primary-medium">
                Categoria
              </p>
              <p className="mt-1 text-sm text-primary">
                {getEventoAgendaCategoria(selectedEvento)}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {selectedEvento.descricao ??
                "Descrição ainda não informada para este evento."}
            </p>
            <Button
              className="w-full"
              onClick={toggleSelectedEvento}
              type="button"
            >
              {isSelectedSaved ? "Remover da Agenda" : "Salvar na Agenda"}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

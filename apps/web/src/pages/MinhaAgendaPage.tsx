import {
  Bell,
  BellOff,
  CalendarPlus,
  Edit3,
  Search,
  Trash2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ErrorState } from "@/components/ErrorState";
import { Modal } from "@/components/Modal";
import { CardSkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { getMinhaAgenda } from "@/lib/agenda-storage";
import { formatEventoDia } from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { Evento } from "@/types/api";

type AgendaTab = "proximos" | "todos";

type ManualAgendaEvent = {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  local: string;
  criadoEm: string;
};

type AgendaItem = {
  id: string;
  titulo: string;
  dataLabel: string;
  time: string;
  local: string;
  dateTime: Date | null;
  source: "api" | "manual";
  manualEvent?: ManualAgendaEvent;
};

type ManualForm = {
  titulo: string;
  data: string;
  hora: string;
  local: string;
};

const manualEventsKey = "minhaAgendaEventosManuais";
const alertPrefsKey = "minhaAgendaAlertas";

const emptyForm: ManualForm = {
  titulo: "",
  data: "",
  hora: "",
  local: ""
};

export function MinhaAgendaPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [manualEvents, setManualEvents] = useState<ManualAgendaEvent[]>([]);
  const [alertPrefs, setAlertPrefs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<AgendaTab>("proximos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ManualAgendaEvent | null>(
    null
  );
  const [form, setForm] = useState<ManualForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    setSavedIds(getMinhaAgenda());
    setManualEvents(readManualEvents());
    setAlertPrefs(readAlertPrefs());
    void fetchEventos();
  }, [fetchEventos]);

  const items = useMemo(() => {
    const savedItems: AgendaItem[] = eventos
      .filter((evento) => savedIds.includes(evento.id))
      .map((evento) => ({
        id: evento.id,
        titulo: evento.titulo,
        dataLabel: formatEventoDia(evento),
        time: evento.horario,
        local: evento.local,
        dateTime: parseEventDateTime(evento.dia, evento.horario),
        source: "api" as const
      }));

    const manualItems: AgendaItem[] = manualEvents.map((event) => ({
      id: event.id,
      titulo: event.titulo,
      dataLabel: formatManualDate(event.data),
      time: event.hora,
      local: event.local,
      dateTime: parseManualDateTime(event),
      source: "manual" as const,
      manualEvent: event
    }));

    return [...savedItems, ...manualItems].sort((first, second) => {
      const firstTime = first.dateTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const secondTime = second.dateTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return firstTime - secondTime;
    });
  }, [eventos, manualEvents, savedIds]);

  const visibleItems = useMemo(() => {
    if (activeTab === "todos") {
      return items;
    }

    const now = Date.now();
    return items.filter((item) => !item.dateTime || item.dateTime.getTime() >= now);
  }, [activeTab, items]);

  function openCreateModal() {
    setEditingEvent(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(event: ManualAgendaEvent) {
    setEditingEvent(event);
    setForm({
      titulo: event.titulo,
      data: event.data,
      hora: event.hora,
      local: event.local
    });
    setModalOpen(true);
  }

  function saveManualEvent() {
    if (!form.titulo.trim() || !form.data || !form.hora || !form.local.trim()) {
      return;
    }

    const nextEvent: ManualAgendaEvent = {
      id: editingEvent?.id ?? createManualEventId(),
      titulo: form.titulo.trim(),
      data: form.data,
      hora: form.hora,
      local: form.local.trim(),
      criadoEm: editingEvent?.criadoEm ?? new Date().toISOString()
    };
    const nextEvents = editingEvent
      ? manualEvents.map((event) =>
          event.id === editingEvent.id ? nextEvent : event
        )
      : [...manualEvents, nextEvent];

    setManualEvents(nextEvents);
    writeManualEvents(nextEvents);
    setModalOpen(false);
  }

  function removeItem(item: AgendaItem) {
    const confirmed = window.confirm(`Remover "${item.titulo}" da sua agenda?`);

    if (!confirmed) {
      return;
    }

    if (item.source === "manual") {
      const nextEvents = manualEvents.filter((event) => event.id !== item.id);
      setManualEvents(nextEvents);
      writeManualEvents(nextEvents);
      return;
    }

    const nextIds = savedIds.filter((id) => id !== item.id);
    setSavedIds(nextIds);
    window.localStorage.setItem("minhaAgenda", JSON.stringify(nextIds));
  }

  function toggleAlert(itemId: string) {
    const nextPrefs = {
      ...alertPrefs,
      [itemId]: !(alertPrefs[itemId] ?? true)
    };

    setAlertPrefs(nextPrefs);
    window.localStorage.setItem(alertPrefsKey, JSON.stringify(nextPrefs));
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Minha Agenda</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Seus eventos salvos e compromissos manuais em um só lugar.
        </p>
      </section>

      <section className="flex gap-2 rounded-md border bg-expo-white p-2">
        {(["proximos", "todos"] as const).map((tab) => (
          <button
            className={cn(
              "h-10 flex-1 rounded-md text-sm font-semibold transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-primary hover:bg-secondary"
            )}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab === "proximos" ? "Próximos" : "Todos"}
          </button>
        ))}
      </section>

      <Button className="w-full" onClick={openCreateModal} type="button">
        <CalendarPlus aria-hidden="true" className="h-4 w-4" />
        Adicionar Evento Manual
      </Button>

      {loading ? (
        <CardSkeletonList count={3} />
      ) : error ? (
        <ErrorState onRetry={fetchEventos} />
      ) : visibleItems.length === 0 ? (
        <section className="rounded-md border bg-expo-white p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Search aria-hidden="true" className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-primary">Agenda vazia</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Salve eventos da programação ou crie um compromisso manual.
          </p>
          <Button asChild className="mt-4">
            <Link to="/agenda">Explorar Agenda</Link>
          </Button>
        </section>
      ) : (
        <section className="space-y-3">
          {visibleItems.map((item) => {
            const alertEnabled = alertPrefs[item.id] ?? true;

            return (
              <article
                className="rounded-md border bg-expo-white p-4 shadow-sm"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary">
                      {item.time} - {item.dataLabel}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-primary">
                      {item.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.local}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] font-bold uppercase text-primary">
                    {item.source === "manual" ? "Manual" : "Salvo"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button
                    className="px-2 text-xs whitespace-normal"
                    onClick={() => toggleAlert(item.id)}
                    type="button"
                    variant={alertEnabled ? "outline" : "secondary"}
                  >
                    {alertEnabled ? (
                      <Bell aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <BellOff aria-hidden="true" className="h-4 w-4" />
                    )}
                    Alerta
                  </Button>
                  <Button
                    className="px-2 text-xs whitespace-normal"
                    disabled={!item.manualEvent}
                    onClick={() => item.manualEvent && openEditModal(item.manualEvent)}
                    type="button"
                    variant="outline"
                  >
                    <Edit3 aria-hidden="true" className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    className="px-2 text-xs whitespace-normal"
                    onClick={() => removeItem(item)}
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <Modal
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={editingEvent ? "Editar Evento" : "Adicionar Evento"}
      >
        <div className="space-y-3">
          <TextField
            label="Título"
            onChange={(value) => setForm((current) => ({ ...current, titulo: value }))}
            placeholder="Ex.: Encontrar equipe no pavilhão"
            value={form.titulo}
          />
          <TextField
            label="Data"
            onChange={(value) => setForm((current) => ({ ...current, data: value }))}
            type="date"
            value={form.data}
          />
          <TextField
            label="Hora"
            onChange={(value) => setForm((current) => ({ ...current, hora: value }))}
            type="time"
            value={form.hora}
          />
          <TextField
            label="Local"
            onChange={(value) => setForm((current) => ({ ...current, local: value }))}
            placeholder="Ex.: Pavilhão Principal"
            value={form.local}
          />
          <Button className="w-full" onClick={saveManualEvent} type="button">
            Salvar Evento
          </Button>
        </div>
      </Modal>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "time";
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: TextFieldProps) {
  return (
    <label className="block text-sm font-medium text-primary">
      {label}
      <input
        className="mt-1 h-11 w-full rounded-md border bg-expo-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function readManualEvents() {
  const raw = window.localStorage.getItem(manualEventsKey);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isManualAgendaEvent);
  } catch {
    return [];
  }
}

function writeManualEvents(events: ManualAgendaEvent[]) {
  window.localStorage.setItem(manualEventsKey, JSON.stringify(events));
}

function createManualEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `manual-${crypto.randomUUID()}`;
  }

  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readAlertPrefs() {
  const raw = window.localStorage.getItem(alertPrefsKey);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, boolean>>(
      (acc, [key, value]) => {
        if (typeof value === "boolean") {
          acc[key] = value;
        }

        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

function isManualAgendaEvent(value: unknown): value is ManualAgendaEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === "string" &&
    typeof event.titulo === "string" &&
    typeof event.data === "string" &&
    typeof event.hora === "string" &&
    typeof event.local === "string" &&
    typeof event.criadoEm === "string"
  );
}

function parseEventDateTime(date: string, time: string) {
  const dateTime = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isFinite(hours)) {
    dateTime.setHours(hours, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  }

  return Number.isFinite(dateTime.getTime()) ? dateTime : null;
}

function parseManualDateTime(event: ManualAgendaEvent) {
  const dateTime = new Date(`${event.data}T${event.hora}:00`);
  return Number.isFinite(dateTime.getTime()) ? dateTime : null;
}

function formatManualDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (!Number.isFinite(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short"
  })
    .format(parsedDate)
    .replace(".", "")
    .toUpperCase();
}

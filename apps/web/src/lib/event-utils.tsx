import {
  Award,
  CalendarDays,
  Cpu,
  MapPin,
  Music,
  Ribbon,
  Star,
  type LucideIcon
} from "lucide-react";
import type { Evento } from "@/types/api";

export type AgendaCategoria =
  | "Todas"
  | "Shows"
  | "Palestras"
  | "Demonstrações"
  | "Cerimônias";

const eventIcons: Record<string, LucideIcon> = {
  award: Award,
  calendar: CalendarDays,
  cpu: Cpu,
  map: MapPin,
  music: Music,
  ribbon: Ribbon
};

export function getEventoIcon(iconKey: string) {
  return eventIcons[iconKey] ?? Star;
}

function parseEventoDateTime(evento: Evento, field: "start" | "end") {
  const directValue =
    field === "start"
      ? evento.inicio ?? evento.dataInicio
      : evento.fim ?? evento.dataFim;

  if (directValue) {
    return new Date(directValue);
  }

  if (field === "end") {
    return null;
  }

  return null;
}

export function getEventoStartDate(evento: Evento) {
  const directStart = parseEventoDateTime(evento, "start");

  if (directStart && !Number.isNaN(directStart.getTime())) {
    return directStart;
  }

  const day = new Date(evento.dia);
  const [hoursRaw, minutesRaw] = evento.horario.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw ?? "0");

  if (Number.isFinite(hours)) {
    day.setHours(hours, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  }

  return day;
}

export function isEventoAoVivo(evento: Evento, now = new Date()) {
  const start = getEventoStartDate(evento);
  const directEnd = parseEventoDateTime(evento, "end");
  const end =
    directEnd && !Number.isNaN(directEnd.getTime())
      ? directEnd
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  return now >= start && now <= end;
}

export function formatEventoDia(evento: Evento) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(evento.dia));
}

export function getDateKey(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(date));
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getEventoAgendaCategoria(evento: Evento): Exclude<
  AgendaCategoria,
  "Todas"
> {
  const searchableText = normalizeText(
    [
      evento.categoria,
      evento.titulo,
      evento.subtitulo,
      evento.descricao,
      evento.iconKey
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (
    searchableText.includes("show") ||
    searchableText.includes("musica") ||
    searchableText.includes("entretenimento")
  ) {
    return "Shows";
  }

  if (
    searchableText.includes("palestra") ||
    searchableText.includes("conhecimento") ||
    searchableText.includes("painel")
  ) {
    return "Palestras";
  }

  if (
    searchableText.includes("cerimonia") ||
    searchableText.includes("abertura") ||
    searchableText.includes("institucional")
  ) {
    return "Cerimônias";
  }

  return "Demonstrações";
}

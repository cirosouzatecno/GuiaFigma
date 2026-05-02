const MINHA_AGENDA_KEY = "minhaAgenda";

export function getMinhaAgenda() {
  const raw = window.localStorage.getItem(MINHA_AGENDA_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function hasEventoNaAgenda(eventoId: string) {
  return getMinhaAgenda().includes(eventoId);
}

export function toggleEventoNaAgenda(eventoId: string) {
  const agenda = getMinhaAgenda();
  const nextAgenda = agenda.includes(eventoId)
    ? agenda.filter((id) => id !== eventoId)
    : [...agenda, eventoId];

  window.localStorage.setItem(MINHA_AGENDA_KEY, JSON.stringify(nextAgenda));

  return nextAgenda.includes(eventoId);
}

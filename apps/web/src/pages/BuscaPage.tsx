import { CalendarDays, Info, Search, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { CardSkeletonList } from "@/components/Skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api } from "@/services/api";
import type { BuscaResponse } from "@/types/api";

export function BuscaPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BuscaResponse["resultados"] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const normalizedQuery = debouncedQuery.trim();

  const hasQuery = normalizedQuery.length > 0;

  const fetchResults = useCallback(async () => {
    if (!hasQuery) {
      setResults(null);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await api.get<BuscaResponse>("/busca", {
        params: {
          q: normalizedQuery
        }
      });
      setResults(response.data.resultados);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [hasQuery, normalizedQuery]);

  useEffect(() => {
    void fetchResults();
  }, [fetchResults]);

  const totalResults = useMemo(() => {
    if (!results) {
      return 0;
    }

    return (
      results.eventos.length +
      results.expositores.length +
      results.informacoes.length
    );
  }, [results]);

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Busca Global</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pesquise eventos, expositores e informações em um só lugar.
        </p>
      </section>

      <label className="relative block">
        <span className="sr-only">Buscar</span>
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          className="h-12 w-full rounded-md border bg-expo-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite para buscar"
          type="search"
          value={query}
        />
      </label>

      {!hasQuery ? (
        <EmptyState
          icon={Search}
          message="Digite um termo para iniciar a busca."
          title="Busque no guia"
        />
      ) : loading ? (
        <CardSkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={fetchResults} />
      ) : results && totalResults === 0 ? (
        <EmptyState message="Nenhum resultado encontrado para sua busca." />
      ) : results ? (
        <section className="space-y-5">
          <ResultGroup title="Eventos" icon={CalendarDays}>
            {results.eventos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento.</p>
            ) : (
              results.eventos.map((evento) => (
                <button
                  className="w-full rounded-md border bg-expo-white p-3 text-left"
                  key={evento.id}
                  onClick={() => navigate("/agenda")}
                  type="button"
                >
                  <h4 className="font-semibold text-primary">{evento.titulo}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {evento.horario} - {evento.local}
                  </p>
                </button>
              ))
            )}
          </ResultGroup>

          <ResultGroup title="Expositores" icon={Store}>
            {results.expositores.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum expositor.</p>
            ) : (
              results.expositores.map((expositor) => (
                <button
                  className="w-full rounded-md border bg-expo-white p-3 text-left"
                  key={expositor.id}
                  onClick={() => navigate("/expositores")}
                  type="button"
                >
                  <h4 className="font-semibold text-primary">
                    {expositor.emoji} {expositor.nome}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estande {expositor.estande} - {expositor.categoria}
                  </p>
                </button>
              ))
            )}
          </ResultGroup>

          <ResultGroup title="Informações" icon={Info}>
            {results.informacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma informação.
              </p>
            ) : (
              results.informacoes.map((informacao) => (
                <button
                  className="w-full rounded-md border bg-expo-white p-3 text-left"
                  key={informacao.id}
                  onClick={() => navigate("/informacoes")}
                  type="button"
                >
                  <h4 className="font-semibold text-primary">
                    {formatInfoKey(informacao.chave)}
                  </h4>
                  <p className="mt-1 max-h-10 overflow-hidden text-sm text-muted-foreground">
                    {informacao.valor}
                  </p>
                </button>
              ))
            )}
          </ResultGroup>
        </section>
      ) : null}
    </div>
  );
}

type ResultGroupProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

function ResultGroup({ title, icon: Icon, children }: ResultGroupProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-primary">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function formatInfoKey(key: string) {
  const labels: Record<string, string> = {
    alimentacao: "Alimentação",
    atendimento: "Atendimento",
    bilheteria: "Bilheteria",
    endereco: "Endereço",
    estacionamento: "Estacionamento",
    horario_funcionamento: "Horário de Funcionamento",
    horarios: "Horários",
    ingressos: "Ingressos",
    localizacao: "Localização",
    nome_evento: "Nome do Evento",
    periodo: "Período",
    praca_alimentacao: "Praça de Alimentação",
    seguranca: "Segurança",
    telefone_atendimento: "Telefone de Atendimento"
  };

  return (
    labels[key] ??
    key
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

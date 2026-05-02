import {
  Car,
  MapPin,
  ShieldCheck,
  Ticket,
  Utensils,
  Clock
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Modal } from "@/components/Modal";
import { CardSkeletonList } from "@/components/Skeleton";
import { api } from "@/services/api";
import type { Informacao } from "@/types/api";

type InfoCard = {
  id: string;
  title: string;
  icon: LucideIcon;
  keys: string[];
};

const infoCards: InfoCard[] = [
  {
    id: "horarios",
    title: "Horários",
    icon: Clock,
    keys: ["horarios", "horario_funcionamento", "periodo"]
  },
  {
    id: "localizacao",
    title: "Localização",
    icon: MapPin,
    keys: ["localizacao", "endereco"]
  },
  {
    id: "ingressos",
    title: "Ingressos",
    icon: Ticket,
    keys: ["ingressos", "bilheteria"]
  },
  {
    id: "alimentacao",
    title: "Alimentação",
    icon: Utensils,
    keys: ["alimentacao", "praca_alimentacao"]
  },
  {
    id: "estacionamento",
    title: "Estacionamento",
    icon: Car,
    keys: ["estacionamento"]
  },
  {
    id: "seguranca",
    title: "Segurança",
    icon: ShieldCheck,
    keys: ["seguranca", "atendimento", "telefone_atendimento"]
  }
];

export function InformacoesPage() {
  const [informacoes, setInformacoes] = useState<Informacao>({});
  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInformacoes = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get<Informacao>("/informacoes");
      setInformacoes(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInformacoes();
  }, [fetchInformacoes]);

  function getContent(card: InfoCard) {
    const values = card.keys
      .map((key) => informacoes[key])
      .filter((value): value is string => Boolean(value));

    if (values.length > 0) {
      return values.join("\n\n");
    }

    return "Informação ainda não cadastrada.";
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">
          Informações Gerais
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulte dados úteis para planejar sua visita.
        </p>
      </section>

      {loading ? (
        <CardSkeletonList count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchInformacoes} />
      ) : Object.keys(informacoes).length === 0 ? (
        <EmptyState message="Nenhuma informação geral cadastrada." />
      ) : (
        <section className="grid grid-cols-2 gap-3">
          {infoCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                className="min-h-32 rounded-md border bg-expo-white p-4 text-left transition-colors hover:bg-secondary"
                key={card.id}
                onClick={() => setSelectedCard(card)}
                type="button"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-primary">
                  {card.title}
                </h3>
              </button>
            );
          })}
        </section>
      )}

      <Modal
        onClose={() => setSelectedCard(null)}
        open={Boolean(selectedCard)}
        title={selectedCard?.title ?? "Informação"}
      >
        {selectedCard ? (
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {getContent(selectedCard)}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}

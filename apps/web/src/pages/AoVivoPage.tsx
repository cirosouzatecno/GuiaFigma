import { Radio, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { CardSkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { Aviso, AvisoTipo } from "@/types/api";

type AvisoVisual = {
  label: string;
  className: string;
};

const avisoVisualByType: Record<AvisoTipo, AvisoVisual> = {
  ALERTA: {
    label: "Alerta",
    className: "border-red-200 bg-red-50 text-red-800"
  },
  AVISO: {
    label: "Aviso",
    className: "border-yellow-200 bg-yellow-50 text-yellow-900"
  },
  NOTICIA: {
    label: "Notícia",
    className: "border-blue-200 bg-blue-50 text-blue-800"
  },
  DESTAQUE: {
    label: "Destaque",
    className: "border-green-200 bg-green-50 text-green-800"
  }
};

export function AoVivoPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAvisos = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    setError(false);

    try {
      const response = await api.get<Aviso[]>("/avisos");
      setAvisos(response.data);
    } catch {
      setError(true);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAvisos(true);

    const intervalId = window.setInterval(() => {
      void fetchAvisos();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchAvisos]);

  const visibleAvisos = useMemo(
    () => avisos.filter((aviso) => !dismissedIds.includes(aviso.id)),
    [avisos, dismissedIds]
  );

  const recentCount = useMemo(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    return visibleAvisos.filter((aviso) => {
      const createdAt = new Date(aviso.criadoEm).getTime();
      return Number.isFinite(createdAt) && createdAt >= oneHourAgo;
    }).length;
  }, [visibleAvisos]);

  function dismissAviso(avisoId: string) {
    setDismissedIds((current) =>
      current.includes(avisoId) ? current : [...current, avisoId]
    );
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            AO VIVO
          </div>
          <h2 className="mt-3 text-2xl font-bold text-primary">
            Atualizações Ao Vivo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Avisos oficiais atualizados automaticamente.
          </p>
        </div>
        <div className="rounded-md bg-secondary px-3 py-2 text-center">
          <p className="text-xl font-bold text-primary">{recentCount}</p>
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">
            última hora
          </p>
        </div>
      </section>

      {loading ? (
        <CardSkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={() => void fetchAvisos(true)} />
      ) : visibleAvisos.length === 0 ? (
        <EmptyState
          icon={Radio}
          message="Nenhuma atualização no momento"
          title="Tudo tranquilo"
        />
      ) : (
        <section className="space-y-3">
          {visibleAvisos.map((aviso) => {
            const visual = avisoVisualByType[aviso.tipo];

            return (
              <article
                className={cn("rounded-md border p-4 shadow-sm", visual.className)}
                key={aviso.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold uppercase">
                      {visual.label}
                    </span>
                    <h3 className="mt-3 text-base font-bold">{aviso.titulo}</h3>
                  </div>
                  <button
                    aria-label={`Dispensar ${aviso.titulo}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/65 transition-colors hover:bg-white"
                    onClick={() => dismissAviso(aviso.id)}
                    type="button"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6">{aviso.mensagem}</p>
                <p className="mt-3 text-xs font-semibold uppercase opacity-75">
                  {aviso.tempo}
                </p>
              </article>
            );
          })}
        </section>
      )}

      {!loading && !error ? (
        <Button
          className="w-full"
          onClick={() => void fetchAvisos(true)}
          type="button"
          variant="outline"
        >
          Atualizar agora
        </Button>
      ) : null}
    </div>
  );
}

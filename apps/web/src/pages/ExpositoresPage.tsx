import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Modal } from "@/components/Modal";
import { CardSkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizeText } from "@/lib/event-utils";
import { api } from "@/services/api";
import type { Expositor } from "@/types/api";

export function ExpositoresPage() {
  const [expositores, setExpositores] = useState<Expositor[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [search, setSearch] = useState("");
  const [selectedExpositor, setSelectedExpositor] = useState<Expositor | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const [expositoresResponse, categoriasResponse] = await Promise.all([
        api.get<Expositor[]>("/expositores"),
        api.get<string[]>("/expositores/categorias")
      ]);

      setExpositores(expositoresResponse.data);
      setCategorias(categoriasResponse.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  const filteredExpositores = useMemo(() => {
    const normalizedSearch = normalizeText(debouncedSearch);

    return expositores.filter((expositor) => {
      const matchCategoria =
        selectedCategoria === "Todas" ||
        normalizeText(expositor.categoria) === normalizeText(selectedCategoria);
      const searchableText = [
        expositor.nome,
        expositor.estande,
        expositor.categoria,
        expositor.descricao
      ]
        .filter(Boolean)
        .join(" ");
      const matchSearch =
        normalizedSearch.length === 0 ||
        normalizeText(searchableText).includes(normalizedSearch);

      return matchCategoria && matchSearch;
    });
  }, [debouncedSearch, expositores, selectedCategoria]);

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Expositores</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Encontre estandes, categorias e contatos dos expositores.
        </p>
      </section>

      <section className="space-y-3 rounded-md border bg-expo-white p-3">
        <label className="relative block">
          <span className="sr-only">Buscar expositor</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="h-11 w-full rounded-md border bg-expo-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, estande ou categoria"
            type="search"
            value={search}
          />
        </label>

        <label className="block text-sm font-medium text-primary">
          Categoria
          <select
            className="mt-1 h-11 w-full rounded-md border bg-expo-white px-3 text-sm text-primary outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSelectedCategoria(event.target.value)}
            value={selectedCategoria}
          >
            <option value="Todas">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>
      </section>

      {loading ? (
        <CardSkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : filteredExpositores.length === 0 ? (
        <EmptyState message="Nenhum expositor encontrado." />
      ) : (
        <section className="space-y-3">
          {filteredExpositores.map((expositor) => (
            <button
              className="w-full rounded-md border p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
              key={expositor.id}
              onClick={() => setSelectedExpositor(expositor)}
              style={{ backgroundColor: expositor.corFundo }}
              type="button"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-2xl"
                  style={{ color: expositor.corPrimaria }}
                >
                  {expositor.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="truncate text-base font-bold"
                    style={{ color: expositor.corPrimaria }}
                  >
                    {expositor.nome}
                  </h3>
                  <p className="mt-1 text-sm text-primary">
                    Estande {expositor.estande}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
                    {expositor.categoria}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </section>
      )}

      <Modal
        onClose={() => setSelectedExpositor(null)}
        open={Boolean(selectedExpositor)}
        title={selectedExpositor?.nome ?? "Detalhe do expositor"}
      >
        {selectedExpositor ? (
          <div className="space-y-4">
            <div
              className="rounded-md p-4"
              style={{ backgroundColor: selectedExpositor.corFundo }}
            >
              <p
                className="text-3xl"
                style={{ color: selectedExpositor.corPrimaria }}
              >
                {selectedExpositor.emoji}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary">
                Estande {selectedExpositor.estande}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedExpositor.categoria}
              </p>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              {selectedExpositor.descricao ??
                "Descrição ainda não informada para este expositor."}
            </p>

            <div className="space-y-2 rounded-md border p-3 text-sm">
              <p className="text-primary">
                <span className="font-semibold">Contato:</span>{" "}
                {selectedExpositor.contato ?? "Não informado"}
              </p>
              <p className="text-primary">
                <span className="font-semibold">Site:</span>{" "}
                {selectedExpositor.site ? (
                  <a
                    className="text-primary-medium underline underline-offset-4"
                    href={selectedExpositor.site}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {selectedExpositor.site}
                  </a>
                ) : (
                  "Não informado"
                )}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() =>
                setToastMessage(
                  `Mapa do estande ${selectedExpositor.estande} em breve.`
                )
              }
              type="button"
            >
              Ver no Mapa
            </Button>
          </div>
        ) : null}
      </Modal>

      {toastMessage ? (
        <div className="fixed inset-x-0 bottom-20 z-50 px-4">
          <div className="mx-auto max-w-[430px] rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}

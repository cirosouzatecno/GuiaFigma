import { LocateFixed, Minus, Plus, RotateCcw, Search } from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizeText } from "@/lib/event-utils";
import { cn } from "@/lib/utils";

type MapCategory =
  | "Alimentação"
  | "Banheiros"
  | "Pavilhões"
  | "Shows"
  | "Animais"
  | "Hospedagem"
  | "Saúde"
  | "Estacionamento"
  | "Acesso";

type MapPoint = {
  id: string;
  name: string;
  category: MapCategory;
  x: number;
  y: number;
  horario: string;
  descricao: string;
  walkingTime: string;
};

type PanState = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const filters = [
  "Todos",
  "Alimentação",
  "Banheiros",
  "Pavilhões",
  "Shows",
  "Animais",
  "Hospedagem",
  "Saúde",
  "Estacionamento"
] as const;

const entrancePoint: MapPoint = {
  id: "entrada-principal",
  name: "Entrada Principal",
  category: "Acesso",
  x: 36,
  y: 130,
  horario: "08:00 às 23:30",
  descricao: "Acesso principal com bilheteria, catracas e orientação.",
  walkingTime: "0 min"
};

const mapPoints: MapPoint[] = [
  entrancePoint,
  {
    id: "estac-a",
    name: "Estac. A",
    category: "Estacionamento",
    x: 42,
    y: 42,
    horario: "07:30 às 00:00",
    descricao: "Estacionamento próximo ao acesso norte.",
    walkingTime: "4 min"
  },
  {
    id: "estac-b",
    name: "Estac. B",
    category: "Estacionamento",
    x: 176,
    y: 34,
    horario: "07:30 às 00:00",
    descricao: "Área central para carros e vans credenciadas.",
    walkingTime: "6 min"
  },
  {
    id: "estac-c",
    name: "Estac. C",
    category: "Estacionamento",
    x: 322,
    y: 44,
    horario: "07:30 às 00:00",
    descricao: "Estacionamento com acesso rápido aos shows.",
    walkingTime: "9 min"
  },
  {
    id: "arena-shows",
    name: "Arena de Shows",
    category: "Shows",
    x: 304,
    y: 112,
    horario: "18:00 às 23:30",
    descricao: "Palco principal da programação musical da feira.",
    walkingTime: "10 min"
  },
  {
    id: "pavilhao-principal",
    name: "Pavilhão Principal",
    category: "Pavilhões",
    x: 152,
    y: 112,
    horario: "09:00 às 22:00",
    descricao: "Expositores, máquinas, produtos e serviços do agro.",
    walkingTime: "5 min"
  },
  {
    id: "auditorio",
    name: "Auditório",
    category: "Pavilhões",
    x: 220,
    y: 85,
    horario: "09:00 às 19:00",
    descricao: "Palestras, painéis técnicos e encontros institucionais.",
    walkingTime: "7 min"
  },
  {
    id: "leiloes",
    name: "Área de Leilões",
    category: "Animais",
    x: 234,
    y: 174,
    horario: "10:00 às 21:00",
    descricao: "Espaço para remates, julgamentos e negócios pecuários.",
    walkingTime: "8 min"
  },
  {
    id: "alimentacao",
    name: "Praça de Alimentação",
    category: "Alimentação",
    x: 125,
    y: 190,
    horario: "10:00 às 23:00",
    descricao: "Restaurantes, lanches, bebidas e mesas cobertas.",
    walkingTime: "4 min"
  },
  {
    id: "banheiros",
    name: "Banheiros",
    category: "Banheiros",
    x: 80,
    y: 156,
    horario: "08:00 às 23:30",
    descricao: "Sanitários e fraldário com equipe de apoio.",
    walkingTime: "2 min"
  },
  {
    id: "dormitorio",
    name: "Dormitório",
    category: "Hospedagem",
    x: 292,
    y: 216,
    horario: "24 horas",
    descricao: "Área de apoio e descanso para equipes credenciadas.",
    walkingTime: "12 min"
  },
  {
    id: "socorros",
    name: "Primeiros Socorros",
    category: "Saúde",
    x: 76,
    y: 92,
    horario: "08:00 às 00:00",
    descricao: "Atendimento médico inicial e ponto de suporte emergencial.",
    walkingTime: "3 min"
  },
  {
    id: "baias",
    name: "Baias Animais",
    category: "Animais",
    x: 300,
    y: 172,
    horario: "07:00 às 20:00",
    descricao: "Setor de acomodação, manejo e preparação dos animais.",
    walkingTime: "11 min"
  }
];

export function MapaPage() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("Todos");
  const [search, setSearch] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<MapPoint>(entrancePoint);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const dragRef = useRef<DragState | null>(null);
  const debouncedSearch = useDebouncedValue(search, 250);

  const filteredPoints = useMemo(() => {
    const query = normalizeText(debouncedSearch);

    return mapPoints.filter((point) => {
      const matchesFilter =
        activeFilter === "Todos" || point.category === activeFilter;
      const matchesSearch =
        query.length === 0 || normalizeText(point.name).includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, debouncedSearch]);

  const routePoints = useMemo(() => {
    const midX = Math.max(entrancePoint.x + 32, selectedPoint.x - 24);
    const midY = selectedPoint.y > entrancePoint.y ? selectedPoint.y - 20 : 108;

    return `${entrancePoint.x},${entrancePoint.y} ${midX},${entrancePoint.y} ${midX},${midY} ${selectedPoint.x},${selectedPoint.y}`;
  }, [selectedPoint]);

  function zoomIn() {
    setZoom((current) => Math.min(2.2, Number((current + 0.2).toFixed(2))));
  }

  function zoomOut() {
    setZoom((current) => Math.max(0.8, Number((current - 0.2).toFixed(2))));
  }

  function resetMap() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    setPan({
      x: drag.originX + (event.clientX - drag.startX) / zoom,
      y: drag.originY + (event.clientY - drag.startY) / zoom
    });
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Mapa Interativo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Encontre áreas, serviços e rotas dentro do recinto.
        </p>
      </section>

      <section className="space-y-3 rounded-md border bg-expo-white p-3">
        <label className="relative block">
          <span className="sr-only">Buscar local</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="h-11 w-full rounded-md border bg-expo-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome do local"
            type="search"
            value={search}
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                activeFilter === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-expo-white text-primary"
              )}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border bg-[#eef6ea] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-primary">Planta do Recinto</p>
          <div className="flex gap-2">
            <IconButton label="Aumentar zoom" onClick={zoomIn}>
              <Plus aria-hidden="true" className="h-4 w-4" />
            </IconButton>
            <IconButton label="Diminuir zoom" onClick={zoomOut}>
              <Minus aria-hidden="true" className="h-4 w-4" />
            </IconButton>
            <IconButton label="Resetar mapa" onClick={resetMap}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border bg-[#f8fbf6]">
          <svg
            aria-label="Mapa da Expo Rio Preto"
            className="h-[330px] w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="img"
            viewBox="0 0 360 260"
          >
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              <rect fill="#e7f0e1" height="260" width="360" />
              <path
                d="M30 130 H122 V112 H218 V84 H304 V112"
                fill="none"
                stroke="#b8c9b0"
                strokeLinecap="round"
                strokeWidth="14"
              />
              <path
                d="M122 112 V190 H234 V174 H304"
                fill="none"
                stroke="#b8c9b0"
                strokeLinecap="round"
                strokeWidth="14"
              />
              <path
                d="M42 42 H322 M292 216 H300 V172"
                fill="none"
                stroke="#cbd7c5"
                strokeDasharray="6 6"
                strokeLinecap="round"
                strokeWidth="6"
              />
              <rect
                fill="#fff"
                height="72"
                rx="8"
                stroke="#9cb391"
                width="112"
                x="96"
                y="78"
              />
              <text fill="#1e3a10" fontSize="10" fontWeight="700" x="114" y="116">
                Pavilhão Principal
              </text>
              <rect
                fill="#fff7df"
                height="48"
                rx="8"
                stroke="#d4a017"
                width="94"
                x="78"
                y="172"
              />
              <text fill="#1e3a10" fontSize="9" fontWeight="700" x="92" y="198">
                Alimentação
              </text>
              <ellipse
                cx="304"
                cy="112"
                fill="#fde2e2"
                rx="42"
                ry="32"
                stroke="#b91c1c"
              />
              <text fill="#1e3a10" fontSize="9" fontWeight="700" x="276" y="115">
                Arena
              </text>
              <rect
                fill="#f5f0ff"
                height="54"
                rx="8"
                stroke="#8b5cf6"
                width="82"
                x="260"
                y="148"
              />
              <text fill="#1e3a10" fontSize="9" fontWeight="700" x="274" y="178">
                Animais
              </text>

              {selectedPoint.id !== entrancePoint.id ? (
                <polyline
                  className="expo-route-line"
                  fill="none"
                  points={routePoints}
                  stroke="#d4a017"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="5"
                />
              ) : null}

              {filteredPoints.map((point) => (
                <g
                  aria-label={point.name}
                  key={point.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedPoint(point);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPoint(point);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <circle
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedPoint.id === point.id
                        ? "fill-primary"
                        : "fill-expo-white"
                    )}
                    cx={point.x}
                    cy={point.y}
                    r={selectedPoint.id === point.id ? 8 : 6}
                    stroke="#1e3a10"
                    strokeWidth="2"
                  />
                  <title>{point.name}</title>
                  <text
                    aria-label={point.name}
                    fill="#1e3a10"
                    fontSize="7.5"
                    fontWeight="700"
                    pointerEvents="none"
                    textAnchor="middle"
                    x={point.x}
                    y={point.y - 11}
                  >
                    {point.name}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </section>

      <section className="rounded-md border bg-expo-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <LocateFixed aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-primary-medium">
              {selectedPoint.category}
            </p>
            <h3 className="mt-1 text-lg font-bold text-primary">
              {selectedPoint.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedPoint.horario}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {selectedPoint.descricao}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
          <span className="font-medium text-primary">Tempo a pé</span>
          <span className="font-bold text-primary">{selectedPoint.walkingTime}</span>
        </div>
        <Button asChild className="mt-4 w-full">
          <Link to={`/rotas?destino=${encodeURIComponent(selectedPoint.name)}`}>
            Traçar Rota
          </Link>
        </Button>
      </section>
    </div>
  );
}

type IconButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md border bg-expo-white text-primary transition-colors hover:bg-secondary"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

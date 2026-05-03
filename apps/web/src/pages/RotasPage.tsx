import {
  BellOff,
  BellRing,
  Flag,
  Footprints,
  MapPinned,
  Navigation,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteDestination = {
  id: string;
  name: string;
  distance: string;
  walkTime: string;
  color: string;
  x: number;
  y: number;
  instructions: string[];
};

const destinations: RouteDestination[] = [
  {
    id: "portao-c",
    name: "Portão C",
    distance: "450 m",
    walkTime: "6 min",
    color: "#0369a1",
    x: 310,
    y: 68,
    instructions: [
      "Siga reto pela avenida central a partir da entrada principal.",
      "Vire à direita após o pavilhão e acompanhe as placas azuis.",
      "Continue até o corredor de saída do Portão C."
    ]
  },
  {
    id: "arena",
    name: "Arena de Shows",
    distance: "760 m",
    walkTime: "10 min",
    color: "#b91c1c",
    x: 304,
    y: 112,
    instructions: [
      "Passe pela bilheteria e siga pela via principal.",
      "Atravesse a lateral do pavilhão mantendo-se à direita.",
      "Entre pelo acesso sinalizado da Arena de Shows."
    ]
  },
  {
    id: "alimentacao",
    name: "Alimentação",
    distance: "280 m",
    walkTime: "4 min",
    color: "#d4a017",
    x: 125,
    y: 190,
    instructions: [
      "Siga pela alameda central até o primeiro cruzamento.",
      "Vire à esquerda no corredor dos restaurantes.",
      "A Praça de Alimentação estará à frente, na área coberta."
    ]
  },
  {
    id: "auditorio",
    name: "Auditório",
    distance: "520 m",
    walkTime: "7 min",
    color: "#7c3aed",
    x: 220,
    y: 85,
    instructions: [
      "Siga pela avenida principal em direção ao pavilhão.",
      "Contorne o pavilhão pelo lado direito.",
      "A entrada do Auditório fica antes da Arena."
    ]
  },
  {
    id: "leiloes",
    name: "Leilões",
    distance: "610 m",
    walkTime: "8 min",
    color: "#166534",
    x: 234,
    y: 174,
    instructions: [
      "Siga pela alameda central até a praça.",
      "Continue pelo corredor lateral em direção ao setor animal.",
      "A Área de Leilões fica antes das baias principais."
    ]
  }
];

const origin = {
  x: 36,
  y: 130
};

export function RotasPage() {
  const [searchParams] = useSearchParams();
  const initialDestination = useMemo(() => {
    const requested = searchParams.get("destino");
    const normalized = requested?.toLowerCase();

    return (
      destinations.find((destination) =>
        normalized?.includes(destination.name.toLowerCase())
      ) ?? null
    );
  }, [searchParams]);

  const [selectedDestination, setSelectedDestination] =
    useState<RouteDestination | null>(initialDestination);
  const [currentStep, setCurrentStep] = useState(0);
  const [muted, setMuted] = useState(false);

  const routePoints = selectedDestination
    ? `${origin.x},${origin.y} 118,130 118,${selectedDestination.y} ${selectedDestination.x},${selectedDestination.y}`
    : "";
  const currentInstruction = selectedDestination?.instructions[currentStep];

  function selectDestination(destination: RouteDestination) {
    setSelectedDestination(destination);
    setCurrentStep(0);
  }

  function nextStep() {
    if (!selectedDestination) {
      return;
    }

    setCurrentStep((current) =>
      Math.min(current + 1, selectedDestination.instructions.length - 1)
    );
  }

  function endRoute() {
    setSelectedDestination(null);
    setCurrentStep(0);
    setMuted(false);
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Traçar Rota</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um destino e acompanhe as instruções passo a passo.
        </p>
      </section>

      {!selectedDestination ? (
        <section className="space-y-3">
          {destinations.map((destination) => (
            <button
              className="w-full rounded-md border bg-expo-white p-4 text-left shadow-sm transition-colors hover:bg-secondary"
              key={destination.id}
              onClick={() => selectDestination(destination)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: destination.color }}
                >
                  <MapPinned aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-primary">
                    {destination.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {destination.distance} - {destination.walkTime} de caminhada
                  </p>
                </div>
                <Navigation aria-hidden="true" className="h-5 w-5 text-primary" />
              </div>
            </button>
          ))}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="rounded-md border bg-[#f8fbf6] p-3">
            <svg
              aria-label={`Rota para ${selectedDestination.name}`}
              className="h-64 w-full"
              role="img"
              viewBox="0 0 360 240"
            >
              <rect fill="#e7f0e1" height="240" width="360" />
              <path
                d="M36 130 H118 V85 H220 M118 130 V190 H245 M118 130 H304"
                fill="none"
                stroke="#b8c9b0"
                strokeLinecap="round"
                strokeWidth="14"
              />
              <polyline
                className="expo-route-line"
                fill="none"
                points={routePoints}
                stroke={selectedDestination.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
              />
              <circle cx={origin.x} cy={origin.y} fill="#1e3a10" r="8" />
              <text fill="#1e3a10" fontSize="9" fontWeight="700" x="14" y="115">
                Entrada
              </text>
              <circle
                cx={selectedDestination.x}
                cy={selectedDestination.y}
                fill={selectedDestination.color}
                r="9"
              />
              <text
                fill="#1e3a10"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                x={selectedDestination.x}
                y={selectedDestination.y - 15}
              >
                {selectedDestination.name}
              </text>
            </svg>
          </div>

          <article className="rounded-md border bg-expo-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Footprints aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-primary-medium">
                  Passo {currentStep + 1} de{" "}
                  {selectedDestination.instructions.length}
                </p>
                <h3 className="text-lg font-bold text-primary">
                  {selectedDestination.name}
                </h3>
              </div>
            </div>
            <p className="mt-4 rounded-md bg-secondary p-4 text-base font-semibold leading-6 text-primary">
              {currentInstruction}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Flag aria-hidden="true" className="h-4 w-4" />
              {selectedDestination.distance} - {selectedDestination.walkTime}
            </div>
          </article>

          <div className="grid grid-cols-3 gap-2">
            <Button
              className="h-auto min-h-11 px-2 text-xs whitespace-normal"
              disabled={currentStep === selectedDestination.instructions.length - 1}
              onClick={nextStep}
              type="button"
            >
              Próximo Passo
            </Button>
            <Button
              className={cn(
                "h-auto min-h-11 px-2 text-xs whitespace-normal",
                muted && "bg-secondary text-primary"
              )}
              onClick={() => setMuted((current) => !current)}
              type="button"
              variant={muted ? "secondary" : "outline"}
            >
              {muted ? (
                <BellOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <BellRing aria-hidden="true" className="h-4 w-4" />
              )}
              Silenciar
            </Button>
            <Button
              className="h-auto min-h-11 px-2 text-xs whitespace-normal"
              onClick={endRoute}
              type="button"
              variant="destructive"
            >
              <X aria-hidden="true" className="h-4 w-4" />
              Encerrar
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

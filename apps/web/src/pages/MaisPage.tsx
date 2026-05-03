import {
  CalendarDays,
  Download,
  Info,
  Map,
  Navigation,
  Radio,
  Search,
  Send,
  Share2,
  Smartphone,
  Star,
  Store
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type Shortcut = {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type ShortcutSection = {
  title: string;
  items: Shortcut[];
};

const sections: ShortcutSection[] = [
  {
    title: "A Feira",
    items: [
      {
        to: "/",
        title: "Home",
        description: "Destaques e atalhos principais.",
        icon: Smartphone
      },
      {
        to: "/agenda",
        title: "Agenda",
        description: "Programação completa do evento.",
        icon: CalendarDays
      },
      {
        to: "/expositores",
        title: "Expositores",
        description: "Empresas, estandes e contatos.",
        icon: Store
      }
    ]
  },
  {
    title: "Navegação",
    items: [
      {
        to: "/mapa",
        title: "Mapa",
        description: "Planta interativa do recinto.",
        icon: Map
      },
      {
        to: "/rotas",
        title: "Rotas",
        description: "Orientação passo a passo.",
        icon: Navigation
      },
      {
        to: "/busca",
        title: "Busca",
        description: "Encontre eventos e informações.",
        icon: Search
      }
    ]
  },
  {
    title: "Informações",
    items: [
      {
        to: "/informacoes",
        title: "Informações Gerais",
        description: "Horários, endereço e serviços.",
        icon: Info
      },
      {
        to: "/ao-vivo",
        title: "Ao Vivo",
        description: "Avisos oficiais em tempo real.",
        icon: Radio
      }
    ]
  },
  {
    title: "App",
    items: [
      {
        to: "/minha-agenda",
        title: "Minha Agenda",
        description: "Eventos salvos e lembretes.",
        icon: Star
      }
    ]
  }
];

export function MaisPage() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  async function shareApp() {
    const shareData = {
      title: "Guia Expo Rio Preto 2026",
      text: "Acesse o guia oficial da Expo Rio Preto 2026.",
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setFeedback("Link do app copiado.");
        return;
      }

      setFeedback("Compartilhamento indisponível neste navegador.");
    } catch {
      setFeedback("Compartilhamento cancelado.");
    }
  }

  async function installApp() {
    if (!installPrompt) {
      setFeedback("Instalação não disponível neste navegador agora.");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    setFeedback(
      choice.outcome === "accepted"
        ? "Instalação iniciada."
        : "Instalação cancelada."
    );
    setInstallPrompt(null);
  }

  return (
    <div className="space-y-5 px-4 py-5">
      <section>
        <h2 className="text-2xl font-bold text-primary">Mais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Atalhos, recursos do app e créditos.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Button className="h-12" onClick={() => void shareApp()} type="button">
          <Share2 aria-hidden="true" className="h-4 w-4" />
          Compartilhar App
        </Button>
        <Button
          className="h-12"
          onClick={() => void installApp()}
          type="button"
          variant="outline"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Instalar App
        </Button>
      </section>

      {sections.map((section) => (
        <section className="space-y-3" key={section.title}>
          <h3 className="text-lg font-bold text-primary">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-center gap-3 rounded-md border bg-expo-white p-4 transition-colors hover:bg-secondary"
                  key={item.to}
                  to={item.to}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-primary">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <footer className="rounded-md border bg-expo-white p-4 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-primary">Guia Expo Rio Preto</p>
        <p className="mt-1">Versão 1.0.0</p>
        <p className="mt-1">Créditos: Prefeitura SJRioPreto e Secretaria Agricultura.</p>
      </footer>

      {feedback ? (
        <div className="fixed inset-x-0 bottom-20 z-50 px-4">
          <div className="mx-auto flex max-w-[430px] items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg">
            <Send aria-hidden="true" className="h-4 w-4" />
            {feedback}
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { createBrowserRouter } from "react-router";
import { App } from "@/App";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AgendaPage } from "@/pages/AgendaPage";
import { BuscaPage } from "@/pages/BuscaPage";
import { ExpositoresPage } from "@/pages/ExpositoresPage";
import { HomePage } from "@/pages/HomePage";
import { InformacoesPage } from "@/pages/InformacoesPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />
          },
          {
            path: "agenda",
            element: <AgendaPage />
          },
          {
            path: "mapa",
            element: <PlaceholderPage name="Mapa" />
          },
          {
            path: "rotas",
            element: <PlaceholderPage name="Rotas" />
          },
          {
            path: "ao-vivo",
            element: <PlaceholderPage name="Ao Vivo" />
          },
          {
            path: "expositores",
            element: <ExpositoresPage />
          },
          {
            path: "minha-agenda",
            element: <PlaceholderPage name="Minha Agenda" />
          },
          {
            path: "informacoes",
            element: <InformacoesPage />
          },
          {
            path: "busca",
            element: <BuscaPage />
          },
          {
            path: "mais",
            element: <PlaceholderPage name="Mais" />
          }
        ]
      },
      {
        path: "admin/login",
        element: <PlaceholderPage name="Admin Login" />
      },
      {
        path: "admin",
        element: (
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <PlaceholderPage name="Admin Dashboard" />
          },
          {
            path: "eventos",
            element: <PlaceholderPage name="Admin Eventos" />
          },
          {
            path: "expositores",
            element: <PlaceholderPage name="Admin Expositores" />
          },
          {
            path: "ao-vivo",
            element: <PlaceholderPage name="Admin Ao Vivo" />
          },
          {
            path: "informacoes",
            element: <PlaceholderPage name="Admin Informacoes" />
          }
        ]
      },
      {
        path: "*",
        element: <PlaceholderPage name="Pagina nao encontrada" />
      }
    ]
  }
]);

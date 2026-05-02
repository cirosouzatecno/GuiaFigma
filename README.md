# Guia Expo Rio Preto 2026

Aplicativo web mobile-first para visitantes da Expo Rio Preto 2026.

## Stack

- Frontend: React 18, TypeScript, Vite, React Router v7, Tailwind CSS 4
- UI: shadcn/ui, Radix UI e Lucide React
- Backend: Node.js, Express e TypeScript
- Banco de dados: PostgreSQL com Prisma ORM
- Auth: JWT com refresh token
- Realtime: Socket.io
- Deploy: Vercel para o frontend e Railway para a API

## Estrutura

```txt
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src
│   │       ├── config
│   │       ├── lib
│   │       ├── middlewares
│   │       ├── routes
│   │       ├── schemas
│   │       ├── services
│   │       ├── types
│   │       ├── app.ts
│   │       └── server.ts
│   └── web
│       ├── public
│       └── src
│           ├── components
│           ├── lib
│           ├── routes
│           ├── App.tsx
│           ├── index.css
│           └── main.tsx
└── package.json
```

## Requisitos

- Node.js 20.11 ou superior
- npm 10 ou superior
- PostgreSQL local ou remoto

## Setup

Instale as dependências:

```bash
npm install
```

Crie os arquivos de ambiente:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

Configure `DATABASE_URL` em `apps/api/.env` com a URL do seu PostgreSQL e `ALLOWED_ORIGIN` com o domínio do frontend.

Gere o cliente Prisma:

```bash
npm run prisma:generate
```

Execute a primeira migration:

```bash
npm run prisma:migrate
```

Popule o banco com dados fictícios:

```bash
npm run db:seed
```

Credenciais fictícias criadas pelo seed:

- Usuário: `admin`
- Senha: `admin123`

Rode frontend e backend juntos:

```bash
npm run dev
```

Ou rode cada app separadamente:

```bash
npm run dev:web
npm run dev:api
```

URLs padrão:

- Web: `http://localhost:5173`
- API: `http://localhost:3333`
- Health check: `http://localhost:3333/api/health`

## API REST

Autenticação:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Rotas públicas:

- `GET /api/eventos`
- `GET /api/eventos/:id`
- `GET /api/expositores`
- `GET /api/expositores/categorias`
- `GET /api/expositores/:id`
- `GET /api/avisos`
- `GET /api/informacoes`
- `GET /api/busca?q=termo`

Rotas admin protegidas por Bearer token:

- `GET /api/admin/eventos`
- `POST /api/admin/eventos`
- `PUT /api/admin/eventos/:id`
- `DELETE /api/admin/eventos/:id`
- `GET /api/admin/expositores`
- `POST /api/admin/expositores`
- `PUT /api/admin/expositores/:id`
- `DELETE /api/admin/expositores/:id`
- `GET /api/admin/avisos`
- `POST /api/admin/avisos`
- `PATCH /api/admin/avisos/:id/toggle`
- `DELETE /api/admin/avisos/:id`
- `PUT /api/admin/informacoes`
- `GET /api/admin/dashboard`

Todos os erros seguem o formato:

```json
{
  "erro": "Mensagem do erro.",
  "codigo": 400
}
```

## Scripts úteis

```bash
npm run build
npm run typecheck
npm run prisma:studio
```

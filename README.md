# GuiaFigma

Projeto do aplicativo **Guia Expo Rio Preto**, gerado a partir do protótipo feito no Figma Make.

## Status

O repositório foi inicializado pelo ChatGPT em `main`.

Os arquivos completos do projeto estão organizados no pacote ZIP preparado durante a conversa:

- `guia-expo-rio-preto-fonte.zip`

## Como subir o projeto completo pelo computador

Baixe o ZIP preparado na conversa, extraia e rode os comandos abaixo dentro da pasta extraída:

```bash
git init
git add .
git commit -m "Primeira versão do app Guia Expo Rio Preto"
git branch -M main
git remote add origin https://github.com/cirosouzatecno/GuiaFigma.git
git push -u origin main --force
```

## Como rodar localmente

```bash
npm install
npm run dev
```

Depois acesse:

```txt
http://localhost:5173
```

## Como gerar build

```bash
npm run build
npm run preview
```

## Tecnologias usadas

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Componentes UI baseados em Radix/shadcn

## Próximos passos recomendados

1. Subir todos os arquivos do projeto no repositório.
2. Publicar na Vercel.
3. Criar projeto no Supabase.
4. Substituir `localStorage`/`sessionStorage` por banco real.
5. Implementar login administrativo real.
6. Transformar em PWA para instalação no celular.

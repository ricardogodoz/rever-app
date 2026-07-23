# App Interno Rever

Aplicação web interna para controle operacional e financeiro da Rever. Ver `CLAUDE.md` e
`docs/` para arquitetura, modelo de dados e roadmap.

## Pré-requisitos

- Node.js 20+
- pnpm (via `corepack enable`)
- Docker (para o PostgreSQL local)

## Rodando localmente

```bash
cp .env.example .env
# edite .env e defina AUTH_SECRET (ex.: openssl rand -base64 32) e ADMIN_PASSWORD

pnpm install
docker compose up -d
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

Acesse http://localhost:3000 e entre com `ADMIN_EMAIL` / `ADMIN_PASSWORD` definidos no `.env`.

## Comandos

```bash
pnpm dev           # servidor de desenvolvimento
pnpm build          # build de produção
pnpm start          # roda o build de produção
pnpm lint           # ESLint
pnpm typecheck      # TypeScript (tsc --noEmit)
pnpm test           # testes unitários (Vitest)
pnpm test:e2e       # testes E2E (Playwright, sobe o dev server automaticamente)
pnpm prisma migrate dev   # cria/aplica migrations
pnpm prisma db seed       # cria/atualiza o administrador a partir do .env
pnpm prisma studio        # explorar o banco visualmente
docker compose up -d      # sobe o PostgreSQL local
docker compose down       # derruba o PostgreSQL local
```

## Documentação

- `CLAUDE.md` — visão geral para trabalhar no projeto.
- `docs/requirements-summary.md` — resumo dos requisitos (fonte completa em
  `docs/requisitos.pdf`).
- `docs/architecture.md` — arquitetura e decisões técnicas.
- `docs/data-model.md` — entidades e modelo de dados.
- `docs/roadmap.md` — marcos e tarefas.
- `docs/progress.md` — status atual do desenvolvimento.

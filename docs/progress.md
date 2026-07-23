# Progresso — App Interno Rever

## Concluído

**M0 — Fundação do projeto** (2026-07-23)

- Next.js 16 (App Router, TypeScript strict, Turbopack), Tailwind CSS 4 + shadcn/ui
  (`base-nova`), pnpm.
- Docker Compose com PostgreSQL 16; Prisma 7 (driver adapter `@prisma/adapter-pg`) com model
  `User` único; migration inicial aplicada; seed do administrador via
  `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` (sem senha fixa no código).
- Auth.js v5 (`next-auth@beta`), Credentials provider, sessão JWT, hash de senha com
  `bcryptjs`.
- Proteção de rotas via `src/proxy.ts` (convenção `proxy` do Next.js 16, substitui
  `middleware.ts`; roda em runtime Node.js, compatível com Prisma).
- Layout autenticado com sidebar (12 módulos do PDF) responsiva (Sheet no mobile), header com
  logout, página inicial "Projeto iniciado", placeholders para os demais módulos.
- Testes: Vitest (schema Zod de login) e Playwright (redirecionamento sem sessão, erro
  genérico de credenciais, fluxo completo de login + logout). `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, `pnpm test:e2e` e `pnpm build` passam sem erros.
- Documentação criada: `CLAUDE.md`, `docs/requirements-summary.md`,
  `docs/architecture.md`, `docs/data-model.md`, `docs/roadmap.md`.

**F1.1 — CRUD de Produtos** (2026-07-23)

- Model `Product` no Prisma (`ProductType`, `UnitOfMeasure`, SKU único, campos monetários
  `Decimal`, auditoria `createdBy`/`updatedBy`); migration `add_product` aplicada.
- Módulo `src/modules/products/` (schemas Zod, services com regra de SKU único, Server
  Actions) seguindo o fluxo Formulário → Action → Service → Prisma da arquitetura.
- UI: listagem em `/produtos` com busca (nome/SKU), filtro (tipo/situação), ordenação
  (nome/SKU/tipo, asc/desc) via querystring GET; formulário único (`ProductForm`) reutilizado
  em `/produtos/novo` e `/produtos/[id]`; inativação/reativação (sem exclusão, conforme
  RN-008) com confirmação.
- Componentes shadcn/ui adicionados: `table`, `select`, `badge` (estilo `base-nova`,
  compatível com `@base-ui/react` já usado no projeto).
- Testes: Vitest para `productSchema`/`productListQuerySchema` (14 testes no total) e
  Playwright cobrindo cadastro → edição → inativação e bloqueio de SKU duplicado.
  `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` e `pnpm build` passam sem erros.

## Tarefa atual

Nenhuma — F1.1 concluído e parado conforme escopo definido.

## Decisões tomadas durante a execução (não previstas no plano original)

- **Auth.js v5 beta**: confirmado como única opção compatível com a API "Auth.js"/App
  Router citada pela decisão técnica original (v4 é o branding antigo "NextAuth").
- **Prisma 7 exige driver adapter**: `datasource.url` não é mais aceito no `schema.prisma`;
  usamos `@prisma/adapter-pg` + `pg`, com a URL vinda de `env.ts` (runtime) e
  `prisma.config.ts` (CLI/migrations).
- **`middleware.ts` → `proxy.ts`**: no Next.js 16 o arquivo de proteção de rotas foi renomeado
  para `proxy.ts` e passou a rodar em runtime Node.js por padrão (antes era Edge, incompatível
  com os módulos nativos usados pelo Prisma).
- **TypeScript 5.9 em vez de 7.0**: `create-next-app` fixou TS 5.9.3 como versão compatível
  com `eslint-config-next`/`typescript-eslint`; mantido esse pin em vez de forçar TS 7 (ainda
  não amplamente suportado pelo ecossistema Next/ESLint no momento da execução).
- Diretórios de "skills" de agente gerados automaticamente pelo `prisma init`
  (`.claude/skills`, `.windsurf/skills`, `.agents/skills`, `skills-lock.json`) foram removidos
  por não fazerem parte do escopo do projeto.
- **Campos monetários/quantidade em formulário como string decimal**: o input do usuário é
  validado por regex (2 casas para valores em R$, 3 para quantidades) e enviado como string
  ao Prisma, que converte para `Decimal` sem passar por `number`/`float` do JS — evita
  imprecisão de ponto flutuante já na validação do formulário.
- **Sem exclusão de produto**: apenas inativar/reativar (RN-008); não há botão de exclusão
  física, mesmo sem movimentação de estoque ainda existir (módulo de Estoque é F1.3).
- **Filtros da listagem via `<form method="get">` nativo**: busca/filtro/ordenação não exigem
  JavaScript no cliente, mantendo a página de listagem como Server Component puro.

## Próxima tarefa recomendada

**F1.2 — CRUD de Armazéns** (RF-ARM-001..003): cadastro, armazém padrão, inativação com
alerta de saldo. Depende apenas do M0, já concluído.

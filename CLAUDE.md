# CLAUDE.md — App Interno Rever

## Objetivo

Aplicação web interna para a Rever controlar produtos/materiais, estoque por armazém,
composição de produtos, produção, contas bancárias, receitas, despesas e vendas. Um único
usuário (Administrador) no MVP. Fonte de verdade completa: `docs/requisitos.pdf`. Resumo
navegável: `docs/requirements-summary.md`.

## Stack

- Next.js (App Router) + TypeScript (strict) — monólito modular, full-stack.
- PostgreSQL via Docker Compose (local) + Prisma (ORM/migrations).
- Auth.js v5 (`next-auth@beta`), Credentials (e-mail/senha), sessão JWT.
- Tailwind CSS + shadcn/ui.
- Zod (validação) + React Hook Form (formulários).
- Vitest (unitário) + Playwright (fluxos críticos E2E).
- pnpm.

## Estrutura do projeto

```
src/app/                 rotas (App Router): login, grupo autenticado (app), api/auth
src/modules/<dominio>/   actions.ts, services.ts, schemas.ts, components/ (por domínio)
src/server/              auth.ts, db.ts (Prisma client), env.ts
src/components/          UI genérica (shadcn/ui) e layout (sidebar, header)
src/lib/                 utils puros
prisma/                  schema.prisma, seed.ts
docker-compose.yml       Postgres local
docs/                    requirements-summary, architecture, data-model, roadmap, progress
```

Detalhes de fluxo (UI → Server Action → Service → Prisma) em `docs/architecture.md`.
Entidades e enums em `docs/data-model.md`.

## Comandos principais

```
pnpm install
docker compose up -d
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
pnpm lint
pnpm typecheck
pnpm test        # vitest
pnpm test:e2e    # playwright
```

## Convenções obrigatórias

- Código, tabelas, nomes técnicos: **inglês**. Textos de interface: **português do Brasil**.
- Datas exibidas em `DD/MM/AAAA`, fuso `America/Sao_Paulo`.
- Valores monetários: sempre `Decimal` (Prisma `@db.Decimal`), **nunca** `Float`.
- Toda alteração de estoque ou financeiro ocorre **no servidor** (Server Action → Service),
  nunca só na UI.
- Operações com múltiplos registros (transferência, produção, confirmação/cancelamento de
  venda) usam `prisma.$transaction` — tudo ou nada.
- Registros concluídos **nunca são apagados**: cancelamento ou estorno, sempre preservando
  histórico.
- Toda entidade de negócio tem auditoria: `createdAt`, `updatedAt`, `createdById`,
  `updatedById`.
- Cadastros com histórico são **inativados** (`active: false`), nunca excluídos.

## Regras críticas de estoque e financeiro

- Estoque **nunca** pode ficar negativo (bloqueado no service antes do commit).
- Saldo de conta bancária = saldo inicial + receitas **recebidas** − despesas **pagas**
  (pendentes não contam).
- Produção só conclui com estoque suficiente de todos os materiais; conclusão gera saída dos
  materiais + entrada do produto final na mesma transação.
- Venda confirmada gera saída de estoque; venda recebida gera/atualiza receita financeira
  vinculada.
- Cancelamentos geram estornos (movimentação/lançamento inverso), nunca deleção.

## Onde não improvisar

- Não implementar integrações externas fora do MVP (ver "fora do escopo" em
  `docs/requirements-summary.md`).
- Não colocar regra de negócio importante só na interface — sempre validar no service.
- Não usar múltiplos usuários/perfis — arquitetura já prepara (auditoria), mas RBAC é fora do
  MVP.

## Gestão de contexto e execução

- Antes de iniciar uma tarefa, leia `docs/progress.md`.
- Execute somente o marco ou tarefa explicitamente solicitado e pare ao concluí-lo.
- Leia apenas as seções dos documentos relevantes para a tarefa atual.
- Não releia `docs/requisitos.pdf`, exceto quando os documentos resumidos não resolverem uma
  ambiguidade.
- Não examine o repositório inteiro quando buscas e leituras direcionadas forem suficientes.
- Nunca leia `node_modules`, `.next`, cobertura, arquivos gerados ou lockfiles completos sem
  necessidade.
- Evite explicações extensas durante a execução.
- Ao final, apresente apenas: alterações realizadas, testes executados, problemas pendentes e
  próxima tarefa.
- Atualize `docs/progress.md` após concluir cada marco.
- Não comece automaticamente o próximo marco.

## Documentos de referência

- `docs/requisitos.pdf` — fonte completa original.
- `docs/requirements-summary.md` — resumo de módulos, regras (RN-001..009) e critérios de
  aceite.
- `docs/architecture.md` — estrutura modular, fluxo de dados, autenticação, transações.
- `docs/data-model.md` — entidades, enums, decisões de schema.
- `docs/roadmap.md` — marcos e tarefas numeradas com critério de aceite/dependências.
- `docs/progress.md` — o que foi feito, tarefa atual, próxima tarefa recomendada.

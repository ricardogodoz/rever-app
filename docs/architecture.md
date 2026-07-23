# Arquitetura — App Interno Rever

## Estilo

Monólito modular em Next.js (App Router) + TypeScript. Um único deploy, mas o código é
organizado por domínio para não virar uma bola de lama.

```
src/
  app/                        # rotas (App Router) — só UI e composição de página
    login/
    (app)/                    # grupo de rotas autenticadas (layout com sidebar)
      produtos/ armazens/ estoque/ composicao/ producao/
      bancos/ receitas/ despesas/ vendas/ relatorios/ configuracoes/
    api/auth/[...nextauth]/route.ts
  modules/<dominio>/          # ex.: products, warehouses, stock, sales...
    actions.ts                # Server Actions (mutação) — única porta de entrada de escrita
    services.ts                # regras de negócio, chama Prisma, usa transação quando precisa
    schemas.ts                 # Zod (validação de input, compartilhada client/server)
    components/                # UI específica do módulo
  server/
    auth.ts                    # config Auth.js (Credentials, JWT, callbacks)
    db.ts                       # Prisma client singleton
    env.ts                       # validação Zod de variáveis de ambiente
  components/                  # UI genérica (shadcn/ui) e layout (sidebar, header)
  lib/                         # utils puros (formatação de data/moeda, etc.)
prisma/
  schema.prisma
  seed.ts
```

Em M0 só existem `server/`, `components/layout`, `app/login`, `app/(app)` e os placeholders
de módulo — a pasta `modules/` começa a existir na Fase 1 (Produtos).

## Fluxo de uma operação de escrita

```
Formulário (React Hook Form + Zod)
  → Server Action (modules/<dominio>/actions.ts)   [valida input com o mesmo schema Zod]
    → Service (modules/<dominio>/services.ts)      [regra de negócio, ex.: valida saldo]
      → prisma.$transaction quando a operação afeta mais de um registro (RN-007)
        → Postgres
```

Nenhuma alteração de estoque ou financeiro acontece no cliente — Server Actions são a única
via de escrita, mesmo quando chamadas por um componente client-side. Regras de negócio
importantes (saldo negativo, saldo insuficiente, valores, transições de situação) vivem no
service, nunca só na UI.

## Autenticação

- **Auth.js v5** (`next-auth@beta`), `CredentialsProvider` (e-mail + senha).
- Sessão via **JWT** (sem adapter de banco — não há OAuth no MVP; o Prisma é usado
  diretamente no `authorize()` para buscar o `User` e comparar o hash com `bcryptjs`).
- `middleware.ts` na raiz protege todas as rotas exceto `/login` e assets; usuário não
  autenticado é redirecionado para `/login`; usuário autenticado que acessa `/login` é
  redirecionado para `/`.
- Único perfil (Administrador) no MVP — sem RBAC. A estrutura de auditoria (`createdById`/
  `updatedById` nas entidades futuras) já prepara para múltiplos usuários sem exigir
  retrabalho de schema.

## Transações

Toda operação que gera mais de um registro relacionado (transferência de estoque, conclusão/
cancelamento de produção, confirmação/cancelamento de venda) usa `prisma.$transaction`. Se
qualquer passo falhar, nada é persistido (RN-007). Constraints de negócio (estoque não
pode ficar negativo) são checadas dentro da própria transação antes do commit.

## Anexos (Fase 3 — Vendas)

Fora do escopo do M0. Decisão já registrada para quando chegar a hora: arquivos ficam fora
do diretório público do Next.js, servidos por uma rota autenticada
(`app/api/attachments/[id]/route.ts`) que verifica sessão e retorna o arquivo — nunca por
caminho estático previsível (RNF-004).

## Decisões pequenas e reversíveis (registradas para não reabrir debate)

- **Formatter**: só ESLint (regra `next lint`) — sem Prettier separado, para não duplicar
  responsabilidade de formatação.
- **Hash de senha**: `bcryptjs` (puro JS) em vez de `bcrypt` nativo — evita depender de
  toolchain de compilação nativa no ambiente de desenvolvimento/CI.
- **Auth.js v5 beta vs v4 estável**: optou-se pela v5 (`next-auth@beta`) por ser a API atual
  ("Auth.js", `auth()`/App Router) citada na decisão técnica do usuário; v4 é o branding
  antigo "NextAuth".
- **Sessão JWT vs banco**: JWT, por não haver OAuth nem necessidade de invalidar sessões
  remotamente no MVP.
- **IDs**: `cuid()` em vez de UUID/serial — evita coordenação extra e é o padrão do Prisma.

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

**F1.2 — CRUD de Armazéns** (2026-07-23)

- Model `Warehouse` no Prisma (código único, `isDefault`, auditoria); migration
  `add_warehouse` aplicada.
- Módulo `src/modules/warehouses/`: exatamente um armazém padrão em todo momento —
  marcar um novo padrão desmarca o anterior na mesma transação; não é possível desmarcar o
  padrão diretamente (é preciso marcar outro); não é possível inativar o armazém padrão.
- UI em `/armazens` (listagem com busca/filtro/ordenação), `/armazens/novo`, `/armazens/[id]`,
  reaproveitando os mesmos padrões de F1.1.

**F1.3 — Movimentações de estoque manuais** (2026-07-23)

- Models `StockBalance` (saldo único por produto+armazém) e `StockMovement` no Prisma, com o
  `StockMovementType` completo do `docs/data-model.md` (entrada/saída manual, ajuste,
  transferência, produção, venda, estorno) — só entrada/saída/ajuste manual têm UI nesta
  tarefa; os demais tipos ficam reservados para as fases 2/3. Migration `add_stock` aplicada.
- Módulo `src/modules/stock/`: `recordManualMovement` roda em `$transaction` (atualiza
  `StockBalance` + cria `StockMovement` juntos) e bloqueia saída que deixaria o saldo
  negativo, com mensagem detalhando disponível/necessário (RN-002).
- UI em `/estoque` (histórico filtrável por produto/armazém/tipo/período) e `/estoque/nova`
  (formulário de entrada/saída/ajuste).
- Retomada do RF-ARM-003 (alerta de saldo ao inativar armazém): `WarehouseActiveToggle` agora
  recebe `hasStock` (calculado via `listWarehouseIdsWithStock`) e ajusta a mensagem de
  confirmação — inativação continua sendo permitida (é só alerta, não bloqueio, diferente da
  regra "não inativar o armazém padrão").

**F1.5 — Estorno de movimentação** (2026-07-23)

- `reverseStockMovement` em `src/modules/stock/services.ts`: cria uma nova `StockMovement` do
  tipo `REVERSAL` referenciando a original via `reversalOfId` (constraint `@unique` no Prisma
  impede mais de um estorno por movimentação no nível do banco), recalcula o `StockBalance` na
  direção oposta e bloqueia se não houver saldo suficiente para o estorno. Não é possível
  estornar um estorno nem uma movimentação já estornada.
- Botão "Estornar" no histórico de `/estoque`, com confirmação obrigatória.

**F1.6 — Relatório de estoque atual** (2026-07-23)

- Módulo `src/modules/reports/`: `getCurrentStockReport` agrega `StockBalance` por produto
  (com filtro opcional por armazém), calcula valor estimado (`quantidade × unitCost`) e
  totalizadores (quantidade de itens e valor total estimado).
- UI em `/relatorios`: filtro por armazém, situação do produto e "só abaixo do mínimo"
  (compara com `Product.minStock`), com badge de destaque nas linhas abaixo do mínimo.

**F1.7 — CRUD de Contas bancárias** (2026-07-23)

- Model `BankAccount` no Prisma (`BankAccountType`, saldo inicial + data, auditoria);
  migration `add_bank_account` aplicada.
- `getAccountBalance` retorna o saldo inicial por enquanto — RN-001 (saldo = inicial +
  receitas recebidas − despesas pagas) só fica completo quando Receitas (F1.8) e Despesas
  (F1.9) existirem; a função já está isolada para ser estendida sem alterar chamadores.
- UI em `/bancos`, `/bancos/novo`, `/bancos/[id]`, mesmos padrões de F1.1/F1.2.

- Testes (acumulado desde M0): Vitest com 33 casos (schemas de produtos, armazéns, estoque,
  contas bancárias) e Playwright com 9 fluxos (login, produtos, armazéns — incluindo troca de
  padrão —, estoque — entrada/saída/bloqueio de saldo/estorno —, contas bancárias).
  `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` e `pnpm build` passam sem erros.

**F1.8 — Receitas simples + categorias** (2026-07-23)

- Models `FinancialCategory` (nome + tipo INCOME/EXPENSE, único por nome+tipo) e
  `FinancialEntry` (kind, origin SIMPLE/SALE, status PENDING/DONE/CANCELLED, categoria, conta,
  valor, datas de competência/vencimento/pagamento, auditoria) no Prisma. Migration
  `add_financial` aplicada. `origin` fixo em `SIMPLE` por enquanto — `SALE` só passa a ser
  usado em F3.4 (receita vinculada a venda).
- Módulo compartilhado `src/modules/financial-entries/` (schemas, services, componentes de
  formulário e de ações de status) reutilizado por Receitas e Despesas, que só diferem no
  `kind` fixo e nas rotas — evita duplicar a lógica de criar/editar/confirmar/cancelar
  lançamento entre os dois módulos.
- Módulo `src/modules/financial-categories/` com CRUD simples (criar + inativar/reativar, sem
  edição de nome/tipo) exposto em `/configuracoes` — reaproveitado por Receitas e Despesas.
- UI em `/receitas`, `/receitas/novo`, `/receitas/[id]`: lançamento pendente é editável;
  DONE/CANCELLED viram detalhe somente leitura. Ação "Marcar como recebida" pede a data de
  recebimento; "Cancelar" muda o status para CANCELLED preservando o registro (RN-003) — como
  o saldo é calculado a partir do status atual, cancelar equivale a estornar sem precisar de
  um registro de estorno separado (diferente de Estoque, que precisa da movimentação inversa).

**F1.9 — Despesas + categorias** (2026-07-23)

- `src/modules/expenses/actions.ts` espelha `src/modules/income/actions.ts` fixando
  `kind: "EXPENSE"`; UI em `/despesas`, `/despesas/novo`, `/despesas/[id]` idêntica à de
  Receitas (mesmo componente `FinancialEntryForm`/`EntryStatusActions`), com rótulos "paga"
  em vez de "recebida". RF-DES-005 (anexos) fica para F3.6, conforme o roadmap.
- `getAccountBalances` (bulk, em `financial-entries/services.ts`) agora soma receitas DONE e
  subtrai despesas DONE por conta — RN-001 completo. Substituiu o antigo
  `getAccountBalance` (que só devolvia o saldo inicial) nas telas de `/bancos`.

**F1.10 — Extrato financeiro por conta + saldo financeiro** (2026-07-23)

- `getAccountStatement` (extrato): lista só lançamentos DONE de uma conta, ordenados por data
  de pagamento, com saldo corrente calculado incrementalmente a partir do saldo inicial —
  lançamentos pendentes/cancelados não aparecem, por representarem dinheiro que ainda não
  mudou de mãos (mesma leitura de "saldo realizado" já usada em `/bancos`).
- `getFinancialSummary` (saldo financeiro): saldo consolidado das contas ativas, reaproveitando
  `getAccountBalances`.
- UI: `/relatorios` ganhou uma sub-navegação (`ReportsNav`) entre "Estoque atual" (F1.6),
  "Saldo financeiro" (`/relatorios/financeiro`) e "Extrato por conta"
  (`/relatorios/extrato`) — mantém as três telas de relatório sob o mesmo item de menu, sem
  precisar adicionar uma entrada nova na sidebar.

- Testes (acumulado desde M0): Vitest com 48 casos e Playwright com 10 fluxos (login,
  produtos, armazéns, estoque, contas bancárias, e um fluxo financeiro completo:
  categorias → conta → receita recebida → despesa paga → saldo em `/bancos` → extrato →
  cancelamento da despesa → saldo atualizado). `pnpm lint`, `pnpm typecheck`, `pnpm test`,
  `pnpm test:e2e` e `pnpm build` passam sem erros.

**Rework de F1.8/F1.9/F1.10 — modelo `settledAt`/`cancelledAt`** (2026-07-23)

- Decisão de produto do usuário: substituir o fluxo "cadastrar pendente → ação separada de
  marcar como recebida/paga" por um único formulário com uma data nullable
  (`settledAt: DateTime?`) — vazia = pendente, preenchida = recebida (receita) ou paga
  (despesa). Documentos atualizados primeiro (`docs/requirements-summary.md`,
  `docs/data-model.md`, `docs/roadmap.md`), impacto apresentado ao usuário, e só então o
  código foi ajustado.
- Migration `financial_entry_settled_at`: remove `FinancialEntryStatus`/`status`, renomeia
  `paymentDate` → `settledAt`, adiciona `cancelledAt: DateTime?` (estado operacional de
  cancelamento, independente da situação financeira) e torna `bankAccountId` opcional no
  schema (obrigatório só no service, quando `settledAt` está preenchido). Tabela
  `FinancialEntry` foi truncada antes da migration — só continha dado de teste de e2e, sem
  valor a preservar.
- `financial-entries/services.ts`: `markEntryDone` foi removida; `createEntry`/`updateEntry`
  aceitam `settledAt` diretamente; `cancelEntry` seta `cancelledAt = now()`. Todas as leituras
  de saldo/extrato (`getAccountBalances`, `getAccountStatement`, `listEntries`) passaram a
  filtrar por `settledAt: { not: null }, cancelledAt: null` em vez de `status: 'DONE'`.
- UI: removido `EntryStatusActions` (botão "Marcar como recebida/paga" + input de data solto
  na listagem); `FinancialEntryForm` ganhou o campo de data nullable com rótulo condicional
  (`settledAtLabel` prop: "Data de recebimento" para Receitas, "Data de pagamento" para
  Despesas) e `max` no input (mais validação server-side via Zod, usando o fuso
  America/Sao_Paulo para calcular "hoje" — RNF de fuso horário do projeto). Editar um
  lançamento que tinha `settledAt` preenchido e apagar a data agora pede confirmação
  (`window.confirm`) antes de salvar. Páginas de detalhe (`/receitas/[id]`,
  `/despesas/[id]`) travam edição só quando `cancelledAt` está preenchido — um lançamento já
  recebido/pago continua totalmente editável, inclusive a própria data.
- Testes: `financial-entries/schemas.test.ts` reescrito (conta bancária condicionalmente
  obrigatória, data futura rejeitada, `getEntrySituationLabel`); `e2e/financial.spec.ts`
  reescrito para cadastrar já com a data preenchida (sem ação separada), cobrir a remoção de
  `settledAt` com confirmação, e o cancelamento. `pnpm lint`, `pnpm typecheck`, `pnpm test`
  (53 casos), `pnpm test:e2e` (11 fluxos) e `pnpm build` passam sem erros.

**F2.1 — Composição de produtos** (2026-07-23)

- Models `Composition` (`finishedProductId`, `active`, auditoria) e `CompositionItem`
  (`compositionId`, `materialProductId`, `quantity`, único por composição+material) no Prisma;
  migration `add_composition` aplicada.
- Módulo `src/modules/compositions/`: `createComposition` valida produto final ativo do tipo
  `FINISHED`, cada material ativo do tipo `MATERIAL`, e bloqueia criar uma composição ativa
  para um produto final que já tem uma (RF-CMP-003); tudo em `$transaction`
  (`Composition` + `CompositionItem[]`). `calculateEstimatedCost` soma
  `quantidade × custo unitário do material` (RF-CMP-005), tratando material sem `unitCost`
  como 0.
- **Sem edição in-place da composição**: para trocar os materiais de um produto final, o
  usuário inativa a composição atual e cadastra uma nova para o mesmo produto — decisão
  consistente com o roadmap (F2.1 lista só "cadastro, validação, custo estimado", sem
  "edição", diferente de F1.1/F1.2/F1.7) e com o precedente de
  `financial-categories` (só criar + inativar/reativar, sem editar). Isso também resolve
  "produção guarda cópia dos itens usados, não afetada por edições futuras" (RF-CMP-004,
  relevante a partir de F2.2): cada "edição" já é uma nova `Composition`, então uma
  `ProductionItem` snapshot futura nunca muda sob os pés.
- Validação de schema (`compositionSchema`): pelo menos um material, sem material duplicado
  na lista, produto final não pode ser material de si mesmo (checagem estrutural — a
  regra completa "só material" depende do tipo do produto e é reforçada no service).
- **Validação repetida no service** (`assertValidItems` em `services.ts`): mesma regra de
  "produto final não pode ser material da própria composição" e "material não pode se
  repetir" reforçada em `createComposition`, não só no schema Zod da Server Action — segue a
  convenção do projeto ("não colocar regra de negócio importante só na interface"), como
  defesa contra qualquer chamada que não passe pela validação da Action. Na prática, o
  autorreferenciamento (mesmo produto como final e material) é estruturalmente inatingível
  pela UI, já que os dois `<Select>` de `/composicao/nova` são populados por consultas
  disjuntas (`type: FINISHED` vs `type: MATERIAL`) — coberto por teste unitário do schema;
  o caso de material duplicado é alcançável pela UI normalmente e ganhou teste e2e dedicado.
- UI: `/composicao` (listagem com busca por produto final + filtro de situação, contagem de
  materiais, custo estimado, inativar/reativar), `/composicao/nova` (formulário com
  `useFieldArray` do react-hook-form para adicionar/remover linhas de material, custo
  estimado calculado ao vivo no cliente via `useWatch`), `/composicao/[id]` (detalhe
  somente leitura com itens, custo por item e total, botão inativar/reativar).
- Testes: `compositions/schemas.test.ts` (9 casos) e `e2e/compositions.spec.ts` — cadastro
  com 2 materiais, custo estimado exibido no formulário/detalhe/listagem, bloqueio de segunda
  composição ativa para o mesmo produto final, inativação liberando novo cadastro, e bloqueio
  de material repetido na mesma composição. `pnpm lint`, `pnpm typecheck`, `pnpm test`
  (71 casos), `pnpm test:e2e` (13 fluxos) e `pnpm build` passam sem erros.

## Tarefa atual

Nenhuma — F2.1 concluída e parado conforme escopo (não iniciar F2.2 automaticamente).

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
- **F1.4 (transferência entre armazéns) adiado**: a pedido explícito do usuário, não é
  prioritário nesta fase. `docs/roadmap.md` mantém o requisito documentado (RF-EST-006),
  marcado como adiado, para não perder rastreabilidade — a dependência de F1.5 aponta para
  F1.3, não para F1.4, então a lacuna não bloqueia o restante da Fase 1.
- **`StockMovementType` completo desde já**: o enum no Prisma inclui todos os tipos do
  `docs/data-model.md` (inclusive os que só existirão nas Fases 2/3, como
  `PRODUCTION_CONSUME` e `SALE_OUT`) para evitar migration de enum mais tarde; a UI e o
  service desta tarefa só implementam entrada/saída/ajuste manual e estorno.
- **RF-ARM-003 (alerta de saldo) implementado junto com F1.3, não com F1.2**: a regra depende
  de `StockBalance`, que só existe a partir de F1.3. Em F1.2 a inativação de armazém não
  padrão já funcionava; o alerta específico de saldo foi ligado retroativamente depois que o
  módulo de estoque existiu.
- **Estorno bloqueado por constraint de banco, não só na aplicação**: `reversalOfId` é
  `@unique` no Prisma, então mesmo em caso de corrida (duas requisições simultâneas) o banco
  impede duas movimentações de estorno para a mesma movimentação original.
- **Campos "somente data" não usam `timeZone: America/Sao_Paulo` na formatação**: datas como
  `BankAccount.initialBalanceDate` são gravadas como meia-noite UTC e exibidas lendo os
  componentes UTC diretamente (`formatDateOnly`) — formatá-las com fuso America/Sao_Paulo
  (UTC-3) mudaria o dia exibido. Timestamps "de verdade" (`StockMovement.date`, `createdAt`)
  continuam usando `formatDateTime`, que aplica o fuso corretamente.
- **`BankAccountType` sem enum definido no resumo dos requisitos**: `docs/requirements-summary.md`
  não lista os valores do tipo de conta, e não há ferramenta de PDF disponível neste ambiente
  (`pdftotext`/`poppler` ausentes) para consultar `docs/requisitos.pdf`. Adotado
  `CHECKING`/`SAVINGS`/`CASH`/`OTHER` como decisão técnica reversível — ajustar caso o PDF
  especifique valores diferentes.
- **Categoria financeira sem edição de nome/tipo**: só criar e inativar/reativar. Renomear ou
  trocar o tipo de uma categoria em uso poderia confundir lançamentos já existentes (o `kind`
  do lançamento é decidido no momento da criação e não muda com a categoria depois); decisão
  simples e reversível, sem requisito explícito pedindo edição.
- **Edição de lançamento travada só por `cancelledAt`** *(substitui a decisão original de
  travar edição fora do status PENDING — ver rework de 2026-07-23 abaixo)*: um lançamento
  recebido/pago continua totalmente editável, inclusive a própria data de
  recebimento/pagamento; só cancelamento trava a tela em modo leitura.
- **Cancelamento de lançamento não gera registro de estorno**: diferente de Estoque
  (RF-EST-008, que precisa de uma `StockMovement` inversa porque o saldo é a soma de
  movimentações), o saldo financeiro é recalculado a partir de `settledAt`/`cancelledAt` de
  cada `FinancialEntry` — então preencher `cancelledAt` já remove o efeito no saldo,
  preservando o histórico (RN-003) sem precisar de um segundo registro.
- **Extrato mostra só lançamentos recebidos/pagos e não cancelados**: pendentes/cancelados não
  aparecem no extrato porque ainda não afetaram (ou deixaram de afetar) o saldo real da conta;
  para ver todos, a listagem de `/receitas` e `/despesas` tem filtro por situação.

## Próxima tarefa recomendada

F2.1 concluída. Próximo passo natural é **F2.2 — Cadastro de produção + cálculo automático
de materiais** (RF-PRO-001..002), em `docs/roadmap.md`. Depende de F2.1 (concluído) e F1.2
(concluído).

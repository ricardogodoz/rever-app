# Roadmap — App Interno Rever

Tarefas pequenas e numeradas, agrupadas por marco/fase (seção 10 do PDF). Cada tarefa lista
critério de aceite e dependências. Atualize `docs/progress.md` ao concluir cada uma.

## M0 — Fundação do projeto

- **M0.1** Inicializar projeto Next.js (TS, App Router, Tailwind, ESLint).
  Aceite: `pnpm dev` sobe a página padrão. Dependências: nenhuma.
- **M0.2** TypeScript strict + ESLint + `.env.example`.
  Aceite: `pnpm typecheck` e `pnpm lint` rodam sem erro. Dep.: M0.1.
- **M0.3** Docker Compose com Postgres.
  Aceite: `docker compose up -d` sobe Postgres acessível via `DATABASE_URL`. Dep.: nenhuma.
- **M0.4** Prisma configurado + model `User`.
  Aceite: `pnpm prisma migrate dev` cria a tabela `User`. Dep.: M0.3.
- **M0.5** Seed do administrador via env vars.
  Aceite: `pnpm prisma db seed` cria/atualiza o admin sem senha fixa no código. Dep.: M0.4.
- **M0.6** Login, logout, proteção de rotas, layout autenticado, sidebar com os 13 módulos
  (placeholders), página inicial "projeto iniciado".
  Aceite: login com credenciais do seed funciona; acesso sem sessão redireciona para
  `/login`; logout encerra sessão. Dep.: M0.5.
- **M0.7** README com comandos exatos + testes (Vitest + Playwright) passando.
  Aceite: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` sem erro. Dep.: M0.6.

## Fase 1 — Estrutura principal

- **F1.1** CRUD de Produtos (RF-PRD-001..007): cadastro, edição, inativação, busca/filtro/
  ordenação, SKU único. Dep.: M0.
- **F1.2** CRUD de Armazéns (RF-ARM-001..003): cadastro, armazém padrão, inativação com
  alerta de saldo. Dep.: M0.
- **F1.3** Movimentações de estoque manuais (RF-EST-002..005, 007..009): entrada, saída,
  ajuste +/-, validação de saldo não-negativo, histórico filtrável. Dep.: F1.1, F1.2.
- **F1.4** *(adiado — não prioritário nesta fase)* Transferência entre armazéns
  (RF-EST-006): transação atômica de 2 movimentações. Dep.: F1.3.
- **F1.5** Estorno de movimentação (RF-EST-008). Dep.: F1.3.
- **F1.6** Relatório de estoque atual (RF-REL-001) com totalizadores e filtro por mínimo.
  Dep.: F1.3.
- **F1.7** CRUD de Contas bancárias (RF-BAN-001..003) com cálculo de saldo. Dep.: M0.
- **F1.8** Receitas simples (RF-REC-001..005) + categorias (RF-REC-003). Dep.: F1.7.
- **F1.9** Despesas (RF-DES-001..004) + categorias (RF-DES-002). Dep.: F1.7.
- **F1.10** Extrato financeiro por conta + saldo financeiro (RF-REL-003..004). Dep.: F1.8,
  F1.9.

## Fase 2 — Produção

- **F2.1** Composição de produtos (RF-CMP-001..005): cadastro, validação, custo estimado.
  Dep.: F1.1.
- **F2.2** Cadastro de produção + cálculo automático de materiais (RF-PRO-001..002). Dep.:
  F2.1, F1.2.
- **F2.3** Validação de estoque e conclusão transacional (RF-PRO-003..005): saída de
  materiais + entrada do produto final, tudo ou nada. Dep.: F2.2, F1.3.
- **F2.4** Cancelamento/estorno de produção (RF-PRO-006). Dep.: F2.3.
- **F2.5** Histórico de produção (RF-PRO-007). Dep.: F2.3.

## Fase 3 — Vendas

- **F3.1** Cadastro de venda com dados do cliente direto no registro (RF-VEN-001..002).
  Dep.: F1.1, F1.2.
- **F3.2** Itens da venda + desconto + cálculo do total (RF-VEN-003..005). Dep.: F3.1.
- **F3.3** Confirmação da venda com saída automática de estoque (RF-VEN-006). Dep.: F3.2,
  F1.3.
- **F3.4** Receita vinculada à venda (RF-VEN-007). Dep.: F3.3, F1.8.
- **F3.5** Cancelamento/estorno de venda (RF-VEN-008). Dep.: F3.4.
- **F3.6** Anexos de venda (RF-VEN-009) — mecanismo reaproveitado depois em despesas
  (RF-DES-005). Dep.: F3.1.
- **F3.7** Consulta de vendas com filtros (RF-VEN-010). Dep.: F3.3.

## Fase 4 — Relatórios e melhorias

- **F4.1** Dashboard com indicadores e filtro de período (RF-DSH-001..002). Dep.: Fases 1-3.
- **F4.2** Alertas do dashboard (RF-DSH-003). Dep.: F4.1.
- **F4.3** Exportação CSV/XLSX dos relatórios principais (RF-EXP-001). Dep.: F1.6, F1.10,
  F3.7.
- **F4.4** Versão de impressão dos relatórios (RF-EXP-002). Dep.: F4.3.
- **F4.5** Resumo financeiro com ticket médio (RF-REL-005). Dep.: F1.10, F3.7.
- **F4.6** Revisão de usabilidade/responsividade geral (RNF-003, RNF-005, RNF-008). Dep.:
  Fases 1-3 completas.

## Próxima tarefa recomendada após esta sessão
F1.1 — CRUD de Produtos.

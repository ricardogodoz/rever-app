# Modelo de dados — App Interno Rever

Baseado na seção 7 do `docs/requisitos.pdf`. Este documento descreve as entidades alvo do
MVP completo; o schema Prisma é implementado incrementalmente por fase (ver
`docs/roadmap.md`). Em M0 só existe `User`.

## Convenções

- Chaves primárias: `String @id @default(cuid())`.
- Valores monetários: `Decimal @db.Decimal(12, 2)` — nunca `Float`.
- Quantidades: `Decimal @db.Decimal(14, 3)` (permite decimal para materiais; produtos finais
  usam valores inteiros por convenção, mas o tipo do campo é o mesmo).
- Auditoria (RN-009): toda entidade de negócio tem `createdAt`, `updatedAt`,
  `createdById`/`createdBy` e `updatedById`/`updatedBy` (relação para `User`, `onDelete:
  Restrict` — nunca perder o responsável). `User` em si só tem `createdAt`/`updatedAt`
  (não referencia a si próprio para evitar o problema do ovo e da galinha no seed).
- Inativação (RN-008): entidades cadastrais têm campo `active: Boolean @default(true)` em vez
  de exclusão física quando possuem histórico.
- Datas (RN-006): campos de data distintos por finalidade — nunca um único `date` genérico
  quando o domínio pede competência/vencimento/pagamento.

## Entidades (visão completa do produto)

### User (M0)
`id, name, email (unique), passwordHash, createdAt, updatedAt`.

### Product — Produto
`id, sku (unique), name, type (MATERIAL | FINISHED), unit (UnitOfMeasure), description?,
barcode?, unitCost? (Decimal), defaultPrice? (Decimal), minStock? (Decimal), imageUrl?,
notes?, active, auditoria`.

### Warehouse — Armazém
`id, code, name, location?, isDefault (Boolean), active, auditoria`.

### StockBalance — Saldo de estoque
`id, productId, warehouseId, quantity (Decimal)`. Único por (productId, warehouseId).
Nunca negativo (checado em service, não só em DB).

### StockMovement — Movimentação de estoque
`id, type (enum: MANUAL_IN, MANUAL_OUT, ADJUST_IN, ADJUST_OUT, TRANSFER_OUT, TRANSFER_IN,
PRODUCTION_CONSUME, PRODUCTION_IN, SALE_OUT, REVERSAL), date, productId, quantity,
fromWarehouseId?, toWarehouseId?, reason, notes?, sourceType? (enum: SALE, PRODUCTION,
TRANSFER, ADJUSTMENT), sourceId?, reversalOfId? (self-relation), auditoria`.

### Composition — Composição / CompositionItem
`Composition: id, finishedProductId, active, createdAt`.
`CompositionItem: id, compositionId, materialProductId, quantity`. Sem material duplicado,
sem o próprio produto final como item, quantidade > 0.

### Production — Produção
`id, code (unique), date, finishedProductId, quantity, sourceWarehouseId,
destinationWarehouseId, status (DRAFT | COMPLETED | CANCELLED), notes?, auditoria`.
`ProductionItem` (snapshot da composição no momento da execução): `id, productionId,
materialProductId, quantityPerUnit, quantityUsed`.

### BankAccount — Conta bancária
`id, name, institution?, type (enum), initialBalance (Decimal), initialBalanceDate, notes?,
active, auditoria`.

### FinancialCategory — Categoria (receita/despesa)
`id, name, kind (INCOME | EXPENSE), active`.

### FinancialEntry — Lançamento (receita ou despesa)
`id, kind (INCOME | EXPENSE), origin (SIMPLE | SALE), description, categoryId, amount
(Decimal), competenceDate, dueDate?, settledAt? (DateTime — data de recebimento se
kind=INCOME, de pagamento se kind=EXPENSE), bankAccountId?, cancelledAt? (DateTime — estado
operacional de cancelamento, independente de `settledAt`), sourceId? (venda), notes?,
auditoria`.

Não existe campo de status (`PENDING`/`DONE`/`CANCELLED`) — a situação financeira é sempre
derivada de `settledAt`/`cancelledAt`, nunca guardada em duplicidade:
- `settledAt == null` → pendente. `settledAt != null` → recebida (INCOME) ou paga (EXPENSE).
- `cancelledAt != null` → cancelado (estado operacional à parte, não se confunde com
  "pendente"; um lançamento cancelado pode ou não ter `settledAt` preenchido, mas nunca afeta
  saldo).
- Só entra no saldo bancário (RN-001) um lançamento com `cancelledAt == null` **e**
  `settledAt != null`.
- `bankAccountId` é opcional no schema, mas obrigatório no service sempre que `settledAt`
  estiver preenchido (checado em service, não só em DB — mesmo padrão do saldo de estoque
  não-negativo).
- `settledAt` não aceita data futura (checado em service).
- Editar um lançamento que tinha `settledAt` preenchido e apagar essa data (voltar a
  "pendente") exige confirmação explícita do usuário na UI.

### Sale — Venda / SaleItem
`Sale: id, number (unique), date, customerName, customerDocument?, customerEmail?,
customerPhone?, customerAddress?, status (DRAFT | CONFIRMED | RECEIVED | CANCELLED),
warehouseId, subtotal, discount, shippingCost, total, bankAccountId?, receivedAt?, notes?,
auditoria`.
`SaleItem: id, saleId, productId, quantity, unitPrice, discount, total`.

### Attachment — Anexo
`id, saleId? (ou despesaId, genérico via ownerType/ownerId no futuro), fileName, mimeType,
sizeBytes, storagePath, uploadedById, uploadedAt`.

## Enums previstos
`ProductType (MATERIAL, FINISHED)`, `UnitOfMeasure (UNIT, KG, G, M, CM, L, ML, PACKAGE,
ROLL)`, `StockMovementType` (ver acima), `ProductionStatus`, `SaleStatus`,
`BankAccountType`. `FinancialEntry` não tem enum de status — ver seção acima
(`settledAt`/`cancelledAt`).

## Decisões

- `Decimal` do Prisma (`@db.Decimal`) em todo valor monetário e de quantidade — nunca
  `Float`/`Int` para dinheiro.
- Estoque negativo é bloqueado no service layer antes do commit da transação (RN-002); não é
  apenas uma constraint de UI.
- Estorno sempre cria um novo registro (`REVERSAL`) referenciando o original via
  `reversalOfId`/`sourceId` — nunca `DELETE`.
- Anexos: caminho de armazenamento (`storagePath`) não deve ser servido por URL pública
  previsível (RNF-004) — detalhes em `docs/architecture.md`.
- `FinancialEntry.settledAt` substitui o par `status (PENDING|DONE|CANCELLED)` +
  `paymentDate?` usado inicialmente: uma data nula/preenchida já expressa pendente/recebida
  (ou paga), sem duplicar a mesma informação em dois campos que poderiam divergir. O
  cancelamento é um estado à parte (`cancelledAt`), porque um lançamento pode ser cancelado
  estando pendente ou já recebido/pago — não é um terceiro valor da mesma variável que
  `settledAt` representa.

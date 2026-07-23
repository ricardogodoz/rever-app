# Resumo de Requisitos — App Interno Rever

Fonte completa: `docs/requisitos.pdf`. Este resumo evita reler o PDF inteiro nas próximas
sessões. Códigos RF/RN remetem às seções originais do PDF.

## Objetivo

App interno para a Rever controlar produtos/materiais, estoque por armazém, composição de
produtos, produção, contas financeiras, receitas, despesas e vendas — reduzindo controles
manuais e divergências. Um único usuário: **Administrador** (sem perfis de acesso no MVP).

## Módulos (seção 2 do PDF)

Autenticação, Dashboard, Produtos, Armazéns, Estoque, Composição de produtos, Produção,
Bancos e contas, Receitas, Despesas, Vendas, Relatórios, Configurações.

## Resumo por módulo

- **Autenticação** (RF-AUT-001..003): login e-mail/senha, logout, troca de senha própria.
- **Dashboard** (RF-DSH-001..003): indicadores do período (saldo, receitas, despesas,
  estoque, vendas), filtro de período (padrão: mês atual), alertas (sem estoque, abaixo do
  mínimo, pendências).
- **Produtos** (RF-PRD-001..007): tipo `material` ou `produto final`; SKU único; cada
  variação (tamanho/cor) é um produto separado; inativação em vez de exclusão quando há
  movimentação; busca/filtro/ordenação na listagem.
- **Armazéns** (RF-ARM-001..003): cadastro simples, um armazém padrão, inativação (alerta se
  houver saldo).
- **Estoque** (RF-EST-001..009): saldo por produto+armazém; tipos de movimentação (entrada,
  saída, ajuste +/-, transferência, consumo/entrada de produção, saída por venda, estorno);
  transferência = 2 movimentações atômicas; **nunca permitir saldo negativo**; estorno cria
  movimentação inversa (não apaga); histórico consultável por produto/armazém/tipo/período.
- **Composição de produtos** (RF-CMP-001..005): produto final → lista de materiais com
  quantidade; só materiais como componente; uma composição ativa por produto final; produção
  guarda cópia dos itens usados (não é afetada por edições futuras da composição); custo
  estimado = Σ(quantidade × custo unitário do material).
- **Produção** (RF-PRO-001..007): informa produto final + quantidade → calcula materiais
  necessários; valida estoque suficiente antes de concluir (mensagem detalhando
  faltante/disponível/necessário); conclusão é transação única (saídas de materiais +
  entrada do produto final, tudo ou nada); cancelamento de produção concluída gera estornos
  (retorno de materiais, saída do produto final), só se houver saldo do produto final.
- **Bancos e contas** (RF-BAN-001..003): saldo = saldo inicial + receitas recebidas −
  despesas pagas; pendentes não contam; inativação em vez de exclusão.
- **Receitas** (RF-REC-001..005): simples ou vinculada a venda; situações pendente/recebida/
  cancelada; só "recebida" altera saldo da conta; cancelamento preserva histórico.
- **Despesas** (RF-DES-001..005): situações pendente/paga/cancelada; só "paga" reduz saldo;
  anexos (mesmo mecanismo de vendas).
- **Vendas** (RF-VEN-001..010): cliente informado direto na venda (sem cadastro próprio no
  MVP); itens com produto final ativo, quantidade, valor unitário, desconto; total =
  subtotal − desconto + frete (nunca negativo); confirmação gera saída de estoque
  (bloqueada se saldo insuficiente); recebimento gera receita financeira vinculada;
  cancelamento estorna estoque e receita; anexos (PDF/PNG/JPG/CSV/XLSX, ≤10MB, com
  nome/tipo/tamanho/data/usuário).
- **Relatórios** (RF-REL-001..005, RF-EXP-001..002): estoque atual (com valor estimado),
  movimentações, extrato por conta, saldo financeiro, resumo financeiro (com ticket médio);
  exportação CSV/XLSX; versão para impressão/PDF.

## Regras invariantes (seção 6 — RN)

- **RN-001**: só receita recebida / despesa paga alteram saldo bancário realizado.
- **RN-002**: proibido estoque negativo no MVP.
- **RN-003**: movimentações/lançamentos concluídos nunca são apagados — só cancelamento ou
  estorno.
- **RN-004**: valores monetários em BRL, 2 casas decimais, `Decimal` (nunca float).
- **RN-005**: quantidades aceitam decimais (materiais); produtos finais tipicamente inteiros,
  mas o schema permite decimal.
- **RN-006**: diferenciar data de competência, vencimento, pagamento/recebimento e criação.
- **RN-007**: operações com múltiplos registros são transacionais (transferência, produção,
  confirmação/cancelamento de venda) — tudo ou nada.
- **RN-008**: produtos/armazéns/bancos/categorias com histórico são inativados, não
  excluídos.
- **RN-009**: todo registro de negócio tem createdAt/updatedAt e usuário responsável pela
  criação/alteração (auditoria), preparando para múltiplos usuários no futuro.

## Requisitos não funcionais relevantes (seção 8)

- Web responsivo (prioridade: desktop > tablet > celular).
- Senhas com hash; HTTPS; rotas internas exigem autenticação; anexos sem URL pública
  previsível; validar arquivos enviados.
- Listagens comuns em até 3s; paginação em consultas grandes.
- Backup de banco e anexos (fora do MVP implementar automação, mas não deve ser impedido).
- Mensagens de erro em linguagem simples e específica (ex.: "faltam N unidades de X").
- Confirmação obrigatória em operações sensíveis (cancelar venda/produção, estornar,
  inativar, alterar saldo inicial).
- Datas DD/MM/AAAA, valores R$ 1.234,56, fuso America/Sao_Paulo.

## Critérios de aceite do MVP (seção 9)

Fluxo completo: cadastrar materiais e produtos finais → armazém → estoque inicial →
composição → produção (baixa automática de materiais + entrada do produto final) → conta
bancária → despesa → receita simples → venda com produtos e anexos (saída automática de
estoque + receita vinculada) → consultar estoque atual, extrato financeiro, saldo total →
exportar relatórios.

## Fora do escopo do MVP (seção 11)

Múltiplos usuários/perfis; cadastro completo de clientes/fornecedores; contas a pagar/receber
parceladas; conciliação bancária; integrações (Mercado Pago, WooCommerce, Melhor Envio,
marketplaces); nota fiscal; pedidos de compra; lotes/validade; leitura de código de barras;
app mobile nativo; múltiplas empresas; cálculo contábil/fiscal; produção com etapas; perdas
planejadas; reserva de estoque para pedidos não confirmados.

## Priorização (seção 10) → ver `docs/roadmap.md` para quebra em tarefas
Fase 1: estrutura principal (login, produtos, armazéns, estoque, contas, receitas, despesas,
extrato). Fase 2: produção. Fase 3: vendas. Fase 4: relatórios e melhorias (dashboard,
exportação, alertas).

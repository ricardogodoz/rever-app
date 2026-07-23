import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
});

async function createCategory(page: Page, name: string, kindLabel: string) {
  await page.goto("/configuracoes");
  await page.getByLabel("Nome da categoria").fill(name);
  await page.getByLabel("Tipo").click();
  await page.getByRole("option", { name: kindLabel }).click();
  await page.getByRole("button", { name: "Adicionar categoria" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
}

async function createBankAccount(page: Page, name: string) {
  await page.goto("/bancos/novo");
  await page.getByLabel("Nome da conta").fill(name);
  await page.getByLabel("Saldo inicial (R$)").fill("1000.00");
  await page.getByLabel("Data do saldo inicial").fill("2026-01-01");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/bancos");
}

test("cadastra receita e despesa já com data de recebimento/pagamento, edita e cancela", async ({
  page,
}) => {
  const ts = Date.now();
  const incomeCategory = `Receita E2E ${ts}`;
  const expenseCategory = `Despesa E2E ${ts}`;
  const accountName = `Conta E2E ${ts}`;
  const incomeDescription = `Venda avulsa E2E ${ts}`;
  const expenseDescription = `Compra de material E2E ${ts}`;

  await createCategory(page, incomeCategory, "Receita");
  await createCategory(page, expenseCategory, "Despesa");
  await createBankAccount(page, accountName);

  // Receita já cadastrada como recebida — sem ação separada de "marcar como recebida".
  await page.goto("/receitas/novo");
  await page.getByLabel("Descrição").fill(incomeDescription);
  await page.getByLabel("Categoria").click();
  await page.getByRole("option", { name: incomeCategory }).click();
  await page.getByLabel("Valor (R$)").fill("300.00");
  await page.getByLabel("Data de competência").fill("2026-01-05");
  await page.getByLabel("Data de recebimento").fill("2026-01-06");
  await page.getByLabel("Conta bancária").click();
  await page.getByRole("option", { name: accountName }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/receitas");

  const incomeRow = page.getByRole("row", {
    name: new RegExp(incomeDescription),
  });
  await expect(incomeRow).toBeVisible();
  await expect(
    incomeRow.getByText("Recebida", { exact: true }),
  ).toBeVisible();

  // Despesa já cadastrada como paga.
  await page.goto("/despesas/novo");
  await page.getByLabel("Descrição").fill(expenseDescription);
  await page.getByLabel("Categoria").click();
  await page.getByRole("option", { name: expenseCategory }).click();
  await page.getByLabel("Valor (R$)").fill("100.00");
  await page.getByLabel("Data de competência").fill("2026-01-07");
  await page.getByLabel("Data de pagamento").fill("2026-01-08");
  await page.getByLabel("Conta bancária").click();
  await page.getByRole("option", { name: accountName }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/despesas");

  const expenseRow = page.getByRole("row", {
    name: new RegExp(expenseDescription),
  });
  await expect(expenseRow).toBeVisible();
  await expect(expenseRow.getByText("Paga", { exact: true })).toBeVisible();

  await page.goto("/bancos");
  const accountRow = page.getByRole("row", { name: new RegExp(accountName) });
  await expect(accountRow.getByText("R$ 1.200,00")).toBeVisible();

  await page.goto("/relatorios/extrato");
  await page.getByLabel("Conta").selectOption({ label: accountName });
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page.getByText(incomeDescription)).toBeVisible();
  await expect(page.getByText(expenseDescription)).toBeVisible();

  // Remover a data de pagamento de um lançamento já pago exige confirmação
  // e o lançamento volta a ficar pendente (some do saldo).
  await page.goto("/despesas");
  await page
    .getByRole("row", { name: new RegExp(expenseDescription) })
    .getByRole("link", { name: expenseDescription })
    .click();
  await expect(page.getByLabel("Data de pagamento")).toHaveValue(
    "2026-01-08",
  );
  await page.getByLabel("Data de pagamento").fill("");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/despesas");

  const pendingExpenseRow = page.getByRole("row", {
    name: new RegExp(expenseDescription),
  });
  await expect(
    pendingExpenseRow.getByText("Pendente", { exact: true }),
  ).toBeVisible();

  await page.goto("/bancos");
  await expect(
    page
      .getByRole("row", { name: new RegExp(accountName) })
      .getByText("R$ 1.300,00"),
  ).toBeVisible();

  // Cancelar a receita: some do saldo, preserva o registro com status cancelado.
  await page.goto("/receitas");
  const incomeRowAgain = page.getByRole("row", {
    name: new RegExp(incomeDescription),
  });
  page.once("dialog", (dialog) => dialog.accept());
  await incomeRowAgain.getByRole("button", { name: "Cancelar" }).click();
  await expect(
    incomeRowAgain.getByText("Cancelada", { exact: true }),
  ).toBeVisible();

  await page.goto("/bancos");
  await expect(
    page
      .getByRole("row", { name: new RegExp(accountName) })
      .getByText("R$ 1.000,00"),
  ).toBeVisible();
});

test("bloqueia data de recebimento futura", async ({ page }) => {
  const ts = Date.now();
  const incomeCategory = `Receita Futuro E2E ${ts}`;
  const accountName = `Conta Futuro E2E ${ts}`;
  const incomeDescription = `Receita futura E2E ${ts}`;

  await createCategory(page, incomeCategory, "Receita");
  await createBankAccount(page, accountName);

  await page.goto("/receitas/novo");
  await page.getByLabel("Descrição").fill(incomeDescription);
  await page.getByLabel("Categoria").click();
  await page.getByRole("option", { name: incomeCategory }).click();
  await page.getByLabel("Valor (R$)").fill("50.00");
  await page.getByLabel("Data de competência").fill("2026-01-05");
  await page.getByLabel("Conta bancária").click();
  await page.getByRole("option", { name: accountName }).click();

  // O formulário usa noValidate (a validação é toda via Zod), então `.fill()`
  // consegue setar uma data futura mesmo com o atributo `max` no input.
  await page.getByLabel("Data de recebimento").fill("2999-01-01");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Não é possível informar uma data futura."),
  ).toBeVisible();
  await expect(page).toHaveURL("/receitas/novo");
});

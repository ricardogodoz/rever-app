import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
});

async function createProduct(page: import("@playwright/test").Page, sku: string) {
  await page.goto("/produtos/novo");
  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Nome").fill(`Produto ${sku}`);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/produtos");
}

async function createWarehouse(page: import("@playwright/test").Page, code: string) {
  await page.goto("/armazens/novo");
  await page.getByLabel("Código").fill(code);
  await page.getByLabel("Nome").fill(`Armazém ${code}`);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/armazens");
}

test("registra entrada e saída manual, bloqueia saldo negativo e estorna", async ({
  page,
}) => {
  const sku = `E2E-STK-${Date.now()}`;
  const code = `WH-${Date.now().toString(36)}`;

  await createProduct(page, sku);
  await createWarehouse(page, code);

  await page.goto("/estoque/nova");
  await page.getByLabel("Tipo").click();
  await page.getByRole("option", { name: "Entrada manual" }).click();
  await page.getByLabel("Quantidade").fill("10");
  await page.getByLabel("Produto").click();
  await page.getByRole("option", { name: new RegExp(sku) }).click();
  await page.getByLabel("Armazém").click();
  await page.getByRole("option", { name: new RegExp(code) }).click();
  await page.getByLabel("Motivo").fill("Estoque inicial E2E");
  await page.getByRole("button", { name: "Registrar movimentação" }).click();

  await expect(page).toHaveURL("/estoque");
  const inRow = page.getByRole("row", { name: /Entrada manual/ }).first();
  await expect(inRow).toBeVisible();

  await page.goto("/estoque/nova");
  await page.getByLabel("Tipo").click();
  await page.getByRole("option", { name: "Saída manual" }).click();
  await page.getByLabel("Quantidade").fill("999");
  await page.getByLabel("Produto").click();
  await page.getByRole("option", { name: new RegExp(sku) }).click();
  await page.getByLabel("Armazém").click();
  await page.getByRole("option", { name: new RegExp(code) }).click();
  await page.getByLabel("Motivo").fill("Saída acima do saldo");
  await page.getByRole("button", { name: "Registrar movimentação" }).click();

  await expect(page.getByText(/Saldo insuficiente/)).toBeVisible();
  await expect(page).toHaveURL("/estoque/nova");

  await page.getByLabel("Quantidade").fill("4");
  await page.getByRole("button", { name: "Registrar movimentação" }).click();
  await expect(page).toHaveURL("/estoque");

  const outRow = page
    .getByRole("row", { name: /Saída manual/ })
    .first();
  await expect(outRow).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await outRow.getByRole("button", { name: "Estornar" }).click();

  await expect(outRow.getByText("Estornada")).toBeVisible();
});

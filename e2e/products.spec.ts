import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
});

test("cadastra, edita e inativa um produto", async ({ page }) => {
  const sku = `E2E-${Date.now()}`;

  await page.goto("/produtos");
  await page.getByRole("link", { name: "Novo produto" }).click();
  await expect(page).toHaveURL("/produtos/novo");

  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Nome").fill("Produto de teste E2E");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL("/produtos");
  const row = page.getByRole("row", { name: new RegExp(sku) });
  await expect(row).toBeVisible();
  await expect(row.getByText("Ativo")).toBeVisible();

  await row.getByRole("link", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("Produto de teste E2E");
  await page.getByLabel("Nome").fill("Produto de teste E2E editado");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL("/produtos");
  const editedRow = page.getByRole("row", { name: new RegExp(sku) });
  await expect(editedRow.getByText("Produto de teste E2E editado")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await editedRow.getByRole("button", { name: "Inativar" }).click();
  await expect(editedRow.getByText("Inativo")).toBeVisible();
});

test("bloqueia SKU duplicado", async ({ page }) => {
  const sku = `E2E-DUP-${Date.now()}`;

  await page.goto("/produtos/novo");
  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Nome").fill("Produto original");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/produtos");

  await page.goto("/produtos/novo");
  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Nome").fill("Produto duplicado");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText(`Já existe um produto com o SKU "${sku}".`),
  ).toBeVisible();
  await expect(page).toHaveURL("/produtos/novo");
});

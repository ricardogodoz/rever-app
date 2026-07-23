import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
});

async function createProduct(
  page: Page,
  sku: string,
  type: "Material" | "Produto final",
) {
  await page.goto("/produtos/novo");
  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Nome").fill(`Produto ${sku}`);
  await page.getByLabel("Tipo").click();
  await page.getByRole("option", { name: type }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/produtos");
}

async function createWarehouse(page: Page, code: string) {
  await page.goto("/armazens/novo");
  await page.getByLabel("Código").fill(code);
  await page.getByLabel("Nome").fill(`Armazém ${code}`);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/armazens");
}

async function createComposition(
  page: Page,
  finishedSku: string,
  materialSku: string,
  quantity: string,
) {
  await page.goto("/composicao/nova");
  await page.getByLabel("Produto final").click();
  await page.getByRole("option", { name: new RegExp(finishedSku) }).click();
  await page.getByLabel("Material", { exact: true }).click();
  await page.getByRole("option", { name: new RegExp(materialSku) }).click();
  await page.getByLabel("Quantidade").fill(quantity);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL(/\/composicao\/(?!nova)[\w-]+$/);
}

test("cadastra produção com cálculo automático de materiais", async ({
  page,
}) => {
  const finishedSku = `E2E-PRO-FIN-${Date.now()}`;
  const materialSku = `E2E-PRO-MAT-${Date.now()}`;
  const noRecipeSku = `E2E-PRO-NORECIPE-${Date.now()}`;
  const sourceCode = `WH-SRC-${Date.now().toString(36)}`;
  const destCode = `WH-DST-${Date.now().toString(36)}`;

  await createProduct(page, finishedSku, "Produto final");
  await createProduct(page, materialSku, "Material");
  await createProduct(page, noRecipeSku, "Produto final");
  await createWarehouse(page, sourceCode);
  await createWarehouse(page, destCode);
  await createComposition(page, finishedSku, materialSku, "2");

  await page.goto("/producao/nova");

  // produto final sem composição ativa não aparece como opção
  await page.getByLabel("Produto final", { exact: true }).click();
  const finishedOption = page.getByRole("option", {
    name: new RegExp(finishedSku),
  });
  await expect(finishedOption).toBeVisible();
  await expect(
    page.getByRole("option", { name: new RegExp(noRecipeSku) }),
  ).toHaveCount(0);
  await finishedOption.click();

  await page.getByLabel("Quantidade a produzir").fill("3");
  await page.getByLabel("Armazém de origem (materiais)").click();
  await page.getByRole("option", { name: new RegExp(sourceCode) }).click();
  await page.getByLabel("Armazém de destino (produto final)").click();
  await page.getByRole("option", { name: new RegExp(destCode) }).click();

  // preview: 2 (qtd. por unidade) * 3 (quantidade a produzir) = 6 (qtd. necessária)
  const preview = page.getByRole("row", { name: new RegExp(materialSku) });
  await expect(preview).toBeVisible();
  await expect(preview.getByRole("cell").nth(2)).toContainText("6");

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(/\/producao\/(?!nova)[\w-]+$/);
  const main = page.locator("main");
  await expect(main.getByText(/^PRD-\d{6}$/)).toBeVisible();
  await expect(main.getByText("Rascunho")).toBeVisible();
  const detailRow = main.getByRole("row", { name: new RegExp(materialSku) });
  await expect(detailRow.getByRole("cell").nth(2)).toContainText("6");

  await page.goto("/producao");
  const listRow = page.getByRole("row", { name: new RegExp(finishedSku) });
  await expect(listRow).toBeVisible();
  await expect(listRow.getByText("Rascunho")).toBeVisible();
});

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
  unitCost?: string,
) {
  await page.goto("/produtos/novo");
  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Nome").fill(`Produto ${sku}`);
  await page.getByLabel("Tipo").click();
  await page.getByRole("option", { name: type }).click();
  if (unitCost) {
    await page.getByLabel("Custo unitário (R$)").fill(unitCost);
  }
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL("/produtos");
}

test("cadastra composição, calcula custo estimado e bloqueia segunda composição ativa", async ({
  page,
}) => {
  const finishedSku = `E2E-CMP-FIN-${Date.now()}`;
  const materialSkuA = `E2E-CMP-MAT-A-${Date.now()}`;
  const materialSkuB = `E2E-CMP-MAT-B-${Date.now()}`;

  await createProduct(page, finishedSku, "Produto final");
  await createProduct(page, materialSkuA, "Material", "10.00");
  await createProduct(page, materialSkuB, "Material", "5.00");

  await page.goto("/composicao/nova");
  await page.getByLabel("Produto final").click();
  await page.getByRole("option", { name: new RegExp(finishedSku) }).click();

  await page.getByLabel("Material", { exact: true }).click();
  await page.getByRole("option", { name: new RegExp(materialSkuA) }).click();
  await page.getByLabel("Quantidade").fill("2");

  await page.getByRole("button", { name: "Adicionar material" }).click();
  const materialSelects = page.getByLabel("Material", { exact: true });
  await materialSelects.nth(1).click();
  await page.getByRole("option", { name: new RegExp(materialSkuB) }).click();
  await page.getByLabel("Quantidade").nth(1).fill("3");

  // custo estimado: 2 * 10.00 + 3 * 5.00 = 35,00
  await expect(page.getByText(/R\$\s*35,00/)).toBeVisible();

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(/\/composicao\/(?!nova)[\w-]+$/);
  const main = page.locator("main");
  await expect(main.getByText(new RegExp(finishedSku))).toBeVisible();
  await expect(main.getByText(/R\$\s*35,00/)).toBeVisible();

  await page.goto("/composicao");
  const row = page.getByRole("row", { name: new RegExp(finishedSku) });
  await expect(row).toBeVisible();
  await expect(row.getByText("Ativa", { exact: true })).toBeVisible();
  await expect(row.getByText(/R\$\s*35,00/)).toBeVisible();

  // uma segunda composição ativa para o mesmo produto final deve ser bloqueada
  await page.goto("/composicao/nova");
  await page.getByLabel("Produto final").click();
  await page.getByRole("option", { name: new RegExp(finishedSku) }).click();
  await page.getByLabel("Material", { exact: true }).click();
  await page.getByRole("option", { name: new RegExp(materialSkuA) }).click();
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText(
      "Este produto final já possui uma composição ativa. Inative-a antes de criar outra.",
    ),
  ).toBeVisible();

  // inativa a composição existente e confirma que agora é possível criar outra
  await page.goto("/composicao");
  const activeRow = page.getByRole("row", { name: new RegExp(finishedSku) });
  page.once("dialog", (dialog) => dialog.accept());
  await activeRow.getByRole("button", { name: "Inativar" }).click();
  await expect(activeRow.getByText("Inativa")).toBeVisible();

  await page.goto("/composicao/nova");
  await page.getByLabel("Produto final").click();
  await page.getByRole("option", { name: new RegExp(finishedSku) }).click();
  await page.getByLabel("Material", { exact: true }).click();
  await page.getByRole("option", { name: new RegExp(materialSkuA) }).click();
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(/\/composicao\/(?!nova)[\w-]+$/);
});

test("bloqueia o mesmo material duas vezes na mesma composição", async ({
  page,
}) => {
  const finishedSku = `E2E-CMP-DUP-FIN-${Date.now()}`;
  const materialSku = `E2E-CMP-DUP-MAT-${Date.now()}`;

  await createProduct(page, finishedSku, "Produto final");
  await createProduct(page, materialSku, "Material", "8.00");

  await page.goto("/composicao/nova");
  await page.getByLabel("Produto final").click();
  await page.getByRole("option", { name: new RegExp(finishedSku) }).click();

  await page.getByLabel("Material", { exact: true }).click();
  await page.getByRole("option", { name: new RegExp(materialSku) }).click();
  await page.getByLabel("Quantidade").fill("1");

  await page.getByRole("button", { name: "Adicionar material" }).click();
  const materialSelects = page.getByLabel("Material", { exact: true });
  await materialSelects.nth(1).click();
  await page.getByRole("option", { name: new RegExp(materialSku) }).click();
  await page.getByLabel("Quantidade").nth(1).fill("2");

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Este material já foi adicionado."),
  ).toBeVisible();
  await expect(page).toHaveURL("/composicao/nova");
});

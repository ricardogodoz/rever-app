import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
});

// Serial: ambos os testes mexem no único armazém padrão global — rodar em
// paralelo faria um teste roubar o padrão do outro (falso negativo).
test.describe.serial("armazém padrão", () => {
  test("cadastra armazém padrão e impede inativação sem substituto", async ({
    page,
  }) => {
    const code = `WH-${Date.now().toString(36)}`;

    await page.goto("/armazens/novo");
    await page.getByLabel("Código").fill(code);
    await page.getByLabel("Nome").fill("Armazém E2E");
    await page.getByRole("checkbox", { name: "Armazém padrão" }).check();
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page).toHaveURL("/armazens");
    const row = page.getByRole("row", { name: new RegExp(code) });
    await expect(row).toBeVisible();
    await expect(row.getByText("Padrão")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Inativar" }).click();
    await expect(
      page.getByText(
        "Não é possível inativar o armazém padrão. Defina outro armazém como padrão antes.",
      ),
    ).toBeVisible();
  });

  test("trocar armazém padrão atualiza automaticamente o anterior", async ({
    page,
  }) => {
    const codeA = `WA-${Date.now().toString(36)}`;
    const codeB = `WB-${Date.now().toString(36)}`;

    await page.goto("/armazens/novo");
    await page.getByLabel("Código").fill(codeA);
    await page.getByLabel("Nome").fill("Armazém A");
    await page.getByRole("checkbox", { name: "Armazém padrão" }).check();
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page).toHaveURL("/armazens");

    await page.goto("/armazens/novo");
    await page.getByLabel("Código").fill(codeB);
    await page.getByLabel("Nome").fill("Armazém B");
    await page.getByRole("checkbox", { name: "Armazém padrão" }).check();
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page).toHaveURL("/armazens");

    const rowA = page.getByRole("row", { name: new RegExp(codeA) });
    const rowB = page.getByRole("row", { name: new RegExp(codeB) });
    await expect(rowB.getByText("Padrão")).toBeVisible();
    await expect(rowA.getByText("Padrão")).not.toBeVisible();
  });
});

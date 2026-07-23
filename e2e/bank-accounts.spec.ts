import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
});

test("cadastra, edita e inativa uma conta bancária", async ({ page }) => {
  const name = `Conta E2E ${Date.now()}`;

  await page.goto("/bancos");
  await page.getByRole("link", { name: "Nova conta" }).click();
  await expect(page).toHaveURL("/bancos/novo");

  await page.getByLabel("Nome da conta").fill(name);
  await page.getByLabel("Saldo inicial (R$)").fill("500.00");
  await page.getByLabel("Data do saldo inicial").fill("2026-01-01");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL("/bancos");
  const row = page.getByRole("row", { name: new RegExp(name) });
  await expect(row).toBeVisible();
  await expect(row.getByText("R$")).toBeVisible();

  await row.getByRole("link", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome da conta")).toHaveValue(name);
  await page.getByLabel("Nome da conta").fill(`${name} editada`);
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL("/bancos");
  const editedRow = page.getByRole("row", {
    name: new RegExp(`${name} editada`),
  });
  await expect(editedRow).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await editedRow.getByRole("button", { name: "Inativar" }).click();
  await expect(editedRow.getByText("Inativo")).toBeVisible();
});

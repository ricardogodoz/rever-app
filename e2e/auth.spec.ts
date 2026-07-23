import { test, expect } from "@playwright/test";

test("acesso sem sessão redireciona para /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/login");
  await expect(page.getByText("Acesse com seu e-mail e senha.")).toBeVisible();
});

test("login com credenciais inválidas mostra mensagem genérica", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("invalido@rever.local");
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

test("login válido dá acesso ao dashboard e logout retorna ao login", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Projeto iniciado")).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/login");
});

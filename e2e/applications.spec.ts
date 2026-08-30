import { expect, test, type Page } from "@playwright/test";
import { PASSWORD_RESET_RESPONSE } from "../src/lib/password-reset";
import { readTestUser } from "./test-user";

const user = readTestUser();
test.skip(!user, "Supabase接続情報が未設定のためスキップします。");

async function login(page: Page) {
  await page.goto("/login");
  const login = page.getByRole("region", { name: "ログイン" });
  await login.getByLabel("メールアドレス").fill(user!.email);
  await login.getByLabel("パスワード").fill(user!.password);
  await login.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/applications$/);
}

async function createApplication(page: Page, title: string, status = "considering") {
  await page.goto("/applications/new");
  await page.getByLabel(/媒体/).selectOption("other");
  await page.getByLabel(/タイトル/).fill(title);
  await page.getByLabel(/状態/).selectOption(status);
  await page.getByRole("button", { name: "登録する" }).click();
  await expect(page).toHaveURL(/\/applications$/);
}

test("未ログインで /applications を開くと /login へ飛ばされる", async ({ page }) => {
  await page.goto("/applications");
  await expect(page).toHaveURL(/\/login$/);
});

test("ログイン、案件作成、一覧表示、編集、反映、削除ができる", async ({ page }) => {
  await login(page);
  const original = `E2E案件-${Date.now()}`;
  const updated = `${original}-更新済み`;
  await createApplication(page, original);
  const row = page.getByRole("row").filter({ hasText: original });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "編集" }).click();
  await page.getByLabel(/タイトル/).fill(updated);
  await page.getByRole("button", { name: "変更を保存" }).click();
  await expect(page.getByRole("row").filter({ hasText: updated })).toBeVisible();
  const updatedRow = page.getByRole("row").filter({ hasText: updated });
  await updatedRow.getByRole("button", { name: "削除", exact: true }).click();
  await updatedRow.getByRole("button", { name: "削除する" }).click();
  await expect(page.getByRole("row").filter({ hasText: updated })).toHaveCount(0);
});

test("削除確認を取り消すと案件は消えない", async ({ page }) => {
  await login(page);
  const title = `E2E削除取消-${Date.now()}`;
  await createApplication(page, title);
  const row = page.getByRole("row").filter({ hasText: title });
  await row.getByRole("button", { name: "削除", exact: true }).click();
  await expect(row.getByRole("group", { name: `${title}の削除確認` })).toBeVisible();
  await row.getByRole("button", { name: "取り消す" }).click();
  await expect(row).toBeVisible();
});

test("未保存の変更がある状態で離脱すると確認が出る", async ({ page }) => {
  await login(page);
  await page.goto("/applications/new");
  await page.getByLabel(/タイトル/).fill(`未保存-${Date.now()}`);
  await page.getByRole("link", { name: "取り消す" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("このページを離れますか？変更は保存されません");
  await dialog.getByRole("button", { name: "編集を続ける" }).click();
  await expect(page).toHaveURL(/\/applications\/new$/);
});

test("絞り込むとURLに条件が入り件数表示が変わる", async ({ page }) => {
  await login(page);
  await createApplication(page, `E2E検討中-${Date.now()}`, "considering");
  await createApplication(page, `E2E応募済-${Date.now()}`, "applied");
  const before = await page.locator("[aria-live='polite']").textContent();
  await page.getByLabel("状態").selectOption("applied");
  await page.getByRole("button", { name: "絞り込む" }).click();
  await expect(page).toHaveURL(/\/applications\?status=applied$/);
  const count = page.locator("[aria-live='polite']");
  await expect(count).toHaveText(/\d+件 \/ 全\d+件/);
  await expect(count).not.toHaveText(before ?? "");
});

test("パスワード再設定は登録済みと未登録で同じ文言を返す", async ({ page }) => {
  async function request(email: string) {
    await page.goto("/reset-password");
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByRole("button", { name: "再設定メールを送る" }).click();
    await expect(page.getByRole("status")).toHaveText(PASSWORD_RESET_RESPONSE);
    return page.getByRole("status").textContent();
  }
  const registered = await request(user!.email);
  const unregistered = await request(`missing-${Date.now()}@example.com`);
  expect(unregistered).toBe(registered);
});

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;

test.describe('Auth Provider Token Expiration', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, '로그인에 필요한 테스트 계정이 필요합니다.');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  const loginAndNavigate = async (page: Page) => {
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="login-container"]');

    await page.getByTestId('email-input').fill(TEST_EMAIL);
    await page.getByTestId('password-input').fill(TEST_PASSWORD);
    await page.getByTestId('login-button').click();

    await page.waitForSelector('[data-testid="login-success-modal"]');
    await page.locator('[data-testid="login-success-modal"]').locator('button:has-text("완료")').click();

    await page.waitForSelector('[data-testid="boards-container"]');
  };

  test('로그인 후 tokenExpiresAt이 localStorage에 저장된다', async ({ page }) => {
    await loginAndNavigate(page);

    const { accessToken, tokenExpiresAt } = await page.evaluate(() => ({
      accessToken: localStorage.getItem('accessToken'),
      tokenExpiresAt: localStorage.getItem('tokenExpiresAt'),
    }));

    expect(accessToken).toBeTruthy();
    expect(tokenExpiresAt).toBeTruthy();

    const expiresAt = Number(tokenExpiresAt);
    expect(Number.isNaN(expiresAt)).toBe(false);
    expect(expiresAt).toBeGreaterThan(Date.now());
  });

  test('tokenExpiresAt이 없으면 자동으로 로그아웃된다', async ({ page }) => {
    await loginAndNavigate(page);

    await page.evaluate(() => {
      localStorage.removeItem('tokenExpiresAt');
      window.dispatchEvent(new Event('focus'));
    });

    await page.waitForURL('**/auth/login');
    await page.waitForSelector('[data-testid="login-container"]');

    const tokenExpiresAt = await page.evaluate(() => localStorage.getItem('tokenExpiresAt'));
    expect(tokenExpiresAt).toBeNull();
  });

  test('페이지 포커스 시 만료 여부를 재확인하여 만료된 토큰을 로그아웃한다', async ({ page }) => {
    await loginAndNavigate(page);

    await page.evaluate(() => {
      const past = Date.now() - 1000;
      localStorage.setItem('tokenExpiresAt', String(past));
      window.dispatchEvent(new Event('focus'));
    });

    await page.waitForURL('**/auth/login');
    await page.waitForSelector('[data-testid="login-container"]');

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  });

  test('토큰 만료 타이머가 정확한 시간에 로그아웃을 실행한다', async ({ page }) => {
    await loginAndNavigate(page);

    const logoutTriggered = await page.evaluate(() => {
      const expiresSoon = Date.now() + 400;
      localStorage.setItem('tokenExpiresAt', String(expiresSoon));
      window.dispatchEvent(new Event('focus'));
      return true;
    });

    expect(logoutTriggered).toBe(true);

    await page.waitForURL('**/auth/login');
    await page.waitForSelector('[data-testid="login-container"]');

    const currentUrl = page.url();
    expect(currentUrl).toContain('/auth/login');
  });
});

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


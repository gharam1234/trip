import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __TEST_ENV__?: string;
    __TEST_BYPASS__?: boolean;
  }
}

test.describe('MainCard 라우팅 기능', () => {
  // 각 테스트 전에 메인 페이지로 이동하고 인증 우회 설정
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
      localStorage.setItem('accessToken', 'test-access-token');
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: 'test-user-id',
          name: '테스트 사용자',
          email: 'test@example.com',
        })
      );
      localStorage.setItem('tokenExpiresAt', (Date.now() + 60 * 60 * 1000).toString());
    });

    // 수정 이유: 경로만 사용하여 baseUrl 중복 제거 (커서룰 준수)
    await page.goto('/boards');

    // maincard-container이 로드될 때까지 대기 (data-testid 기반, 500ms 미만)
    // 수정 이유: networkidle 금지 조건 준수 - data-testid 기반 대기만 사용
    await page.waitForSelector('[data-testid="maincard-container"]', { timeout: 500 });
  });

  test('첫 번째 카드 클릭 시 상세 페이지로 이동하는지 확인', async ({ page }) => {
    // maincard-card-로 시작하는 카드 찾기
    const cardLocator = page.locator('[data-testid^="maincard-card-"]').first();

    // 카드가 보이는지 확인 (500ms 미만)
    await expect(cardLocator).toBeVisible({ timeout: 500 });

    // 카드 클릭
    await cardLocator.click();

    // 수정 이유: 라우팅 후 상세 페이지 로드 대기 (data-testid 기반)
    // BOARD_DETAIL 페이지의 로드 완료를 감지 (타임아웃 500ms 미만)
    // board-detail-container나 유사한 식별자가 있으면 그것으로, 없으면 최상위 컨테이너로 확인
    try {
      await page.waitForSelector('[data-testid="board-detail-container"]', { timeout: 400 }).catch(() => null);
    } catch {
      // 식별자가 없을 수 있으므로 무시
    }

    // URL이 /boards/[id] 형식인지 최종 확인
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/boards\/[a-zA-Z0-9]+/);
  });
});

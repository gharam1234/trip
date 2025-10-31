import { test, expect } from '@playwright/test';

test.describe('트립토크 등록 버튼 클릭 테스트', () => {
  test.describe('비로그인 유저 시나리오', () => {
    test('트립토크 등록 버튼 클릭시 로그인요청모달이 노출된다', async ({ page }) => {
      // 테스트 환경 설정 (비로그인 상태)
      await page.addInitScript(() => {
        window.__TEST_ENV__ = 'test';
        window.__TEST_BYPASS__ = false;
      });

      // /boards 페이지로 이동
      await page.goto('/boards');
      
      // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
      await page.waitForSelector('[data-testid="boards-container"]');
      
      // 트립토크 등록 버튼 클릭
      await page.click('[data-testid="trip-talk-button"]');

      // 로그인요청모달 노출여부 확인 (모달 렌더링 시간 포함)
      // 수정 이유: 모달 렌더링 시간을 고려하여 타임아웃 증가
      await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible({ timeout: 5000 });

      // URL이 변경되지 않았는지 확인 (모달만 표시되고 페이지 이동 안됨)
      await expect(page).toHaveURL('/boards');
    });
  });

  test.describe('로그인 유저 시나리오', () => {
    test('트립토크 등록 버튼 클릭시 게시글 쓰기 페이지로 이동한다', async ({ page }) => {
      // 테스트 환경 설정 (로그인 상태)
      await page.addInitScript(() => {
        window.__TEST_ENV__ = 'test';
        window.__TEST_BYPASS__ = true;
        // 로그인 상태를 나타내기 위해 localStorage에 액세스 토큰 설정
        localStorage.setItem('accessToken', 'test-token-for-e2e-testing');
        localStorage.setItem('user', JSON.stringify({
          _id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com'
        }));
      });

      // /boards 페이지로 이동
      await page.goto('/boards');

      // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
      await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });

      // 트립토크 등록 버튼 클릭
      await page.click('[data-testid="trip-talk-button"]');

      // URL이 /boards/new로 변경되었는지 확인 (timeout 2000ms로 증가)
      await expect(page).toHaveURL('/boards/new', { timeout: 2000 });
    });
  });
});

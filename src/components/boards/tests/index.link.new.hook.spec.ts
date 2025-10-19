import { test, expect } from '@playwright/test';

test.describe('트립토크 등록 버튼 클릭 테스트', () => {
  test('트립토크 등록 버튼 클릭시 /boards/new 페이지로 이동한다', async ({ page }) => {
    // /boards 페이지로 이동
    await page.goto('/boards');
    
    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 트립토크 등록 버튼 클릭
    await page.click('[data-testid="trip-talk-button"]');
    
    // URL이 /boards/new로 변경되었는지 확인
    await expect(page).toHaveURL('/boards/new');
  });
});

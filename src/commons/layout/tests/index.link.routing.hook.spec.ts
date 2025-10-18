import { test, expect } from '@playwright/test';

test.describe('Layout Link Routing Hook', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 페이지로 이동
    await page.goto('/');
    
    // 페이지가 완전히 로드될 때까지 대기 (data-testid 기반)
    // timeout은 500ms 미만으로 설정
    await page.waitForSelector('[data-testid="layout-container"]', { timeout: 400 });
  });

  test('로고 클릭 시 게시글 목록 페이지로 이동해야 함', async ({ page }) => {
    // 로고 요소 클릭
    await page.click('[data-testid="logo-link"]');
    
    // URL이 /boards로 변경되었는지 확인
    await expect(page).toHaveURL('/boards');
    
    // 페이지가 완전히 로드될 때까지 대기 (data-testid 기반)
    // timeout은 500ms 미만으로 설정
    await page.waitForLoadState('domcontentloaded', { timeout: 400 });
  });

  test('로고에 cursor: pointer 스타일이 적용되어야 함', async ({ page }) => {
    const logoElement = page.locator('[data-testid="logo-link"]');
    
    // cursor: pointer 스타일 확인
    await expect(logoElement).toHaveCSS('cursor', 'pointer');
  });

  test('로고 클릭 후 페이지 로드가 완료되어야 함', async ({ page }) => {
    // 로고 클릭
    await page.click('[data-testid="logo-link"]');
    
    // URL 변경 확인
    await expect(page).toHaveURL('/boards');
    
    // 페이지 로드 완료 대기 (networkidle 사용하지 않음)
    // timeout은 500ms 미만으로 설정
    await page.waitForLoadState('domcontentloaded', { timeout: 400 });
    
    // 페이지 제목이나 특정 요소가 로드되었는지 확인
    await expect(page.locator('body')).toBeVisible();
  });
});

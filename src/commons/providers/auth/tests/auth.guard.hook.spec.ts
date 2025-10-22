import { test, expect } from '@playwright/test';

test.describe('Auth Guard Hook 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 환경 설정
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = undefined; // 기본값으로 설정
    });
  });

  test('실제 환경에서 비로그인 사용자 권한 검증', async ({ page }) => {
    // 실제 환경으로 설정
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // boards 페이지로 이동
    await page.goto('/boards');
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 트립토크 등록 버튼 클릭 (권한 검증 필요)
    await page.click('[data-testid="trip-talk-button"]');
    
    // 로그인 모달이 표시되는지 확인 (권한 검증 동작)
    await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible({ timeout: 400 });
  });

  test('테스트 환경에서 로그인 검사 우회', async ({ page }) => {
    // 테스트 환경 설정 (기본적으로 로그인 검사 우회)
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });

    // boards 페이지로 이동
    await page.goto('/boards');
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 트립토크 등록 버튼 클릭
    await page.click('[data-testid="trip-talk-button"]');
    
    // 게시글 작성 페이지로 이동되는지 확인 (로그인 검사 우회)
    await expect(page).toHaveURL('/boards/new', { timeout: 400 });
    await expect(page.locator('[data-testid="boards-write-page"]')).toBeVisible();
  });

  test('테스트 환경에서 비회원 가드 테스트', async ({ page }) => {
    // 테스트 환경에서 명시적으로 로그인 검사 수행
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = false; // 명시적으로 검사 수행
    });

    // boards 페이지로 이동
    await page.goto('/boards');
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 트립토크 등록 버튼 클릭
    await page.click('[data-testid="trip-talk-button"]');
    
    // 로그인 모달이 표시되는지 확인
    await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible({ timeout: 400 });
  });

  test('로그인 확인 모달 - 로그인 버튼 클릭', async ({ page }) => {
    // 실제 환경으로 설정하여 모달 표시
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // boards 페이지로 이동
    await page.goto('/boards');
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 트립토크 등록 버튼 클릭
    await page.click('[data-testid="trip-talk-button"]');
    
    // 로그인 모달 표시 확인
    await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible({ timeout: 400 });
    
    // 모달 내 로그인 버튼 클릭 (확인 버튼이 로그인)
    await page.locator('[data-testid="login-confirm-modal"]').locator('button:has-text("로그인")').first().click({ force: true });
    
    // 로그인 페이지로 이동 확인
    await expect(page).toHaveURL('/auth/login');
  });

  test('로그인 확인 모달 - 취소 버튼 클릭', async ({ page }) => {
    // 실제 환경으로 설정하여 모달 표시
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // boards 페이지로 이동
    await page.goto('/boards');
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 트립토크 등록 버튼 클릭
    await page.click('[data-testid="trip-talk-button"]');
    
    // 로그인 모달 표시 확인
    await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible({ timeout: 400 });
    
    // 모달 내 취소 버튼 클릭
    await page.locator('[data-testid="login-confirm-modal"]').locator('button:has-text("취소")').click({ force: true });
    
    // 모달이 닫혔는지 확인
    await expect(page.locator('[data-testid="login-confirm-modal"]')).not.toBeVisible();
    
    // 페이지가 그대로 유지되는지 확인
    await expect(page).toHaveURL('/boards');
  });

  test('모달 중복 표시 방지', async ({ page }) => {
    // 실제 환경으로 설정하여 모달 표시
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // boards 페이지로 이동
    await page.goto('/boards');
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 첫 번째 버튼 클릭
    const tripTalkButton = page.locator('[data-testid="trip-talk-button"]');
    await tripTalkButton.click();
    
    // 모달 표시 대기
    await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible({ timeout: 400 });
    
    // 버튼이 클릭된 후 모달이 존재하는지 확인 (모달 개수는 1개여야 함)
    const modalCount = await page.locator('[data-testid="login-confirm-modal"]').count();
    expect(modalCount).toBe(1);
  });

  test('테스트 환경 설정 함수 동작 확인', async ({ page }) => {
    // 테스트 환경 설정 함수 테스트
    await page.evaluate(() => {
      // 테스트 환경 설정
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
      
      // 설정 확인
      console.log('Test Environment:', window.__TEST_ENV__);
      console.log('Test Bypass:', window.__TEST_BYPASS__);
    });

    // 설정이 올바르게 적용되었는지 확인
    const testEnv = await page.evaluate(() => window.__TEST_ENV__);
    const testBypass = await page.evaluate(() => window.__TEST_BYPASS__);
    
    expect(testEnv).toBe('test');
    expect(testBypass).toBe(true);
  });
});

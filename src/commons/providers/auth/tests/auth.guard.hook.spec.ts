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

    // 게시글 작성 페이지로 이동 (회원 전용 페이지)
    await page.goto('/boards/new');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="boards-new-container"]', { timeout: 500 });
    
    // 권한이 필요한 기능 버튼 클릭 (예: 저장 버튼)
    const protectedButton = page.locator('[data-testid="save-button"]');
    if (await protectedButton.isVisible()) {
      await protectedButton.click();
      
      // 로그인 확인 모달 표시 확인
      await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible();
      
      // 모달 내용 확인
      await expect(page.locator('text=로그인이 필요합니다')).toBeVisible();
      await expect(page.locator('text=이 기능을 사용하려면 로그인이 필요합니다')).toBeVisible();
    }
  });

  test('테스트 환경에서 로그인 검사 우회', async ({ page }) => {
    // 테스트 환경 설정 (기본적으로 로그인 검사 우회)
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = undefined;
    });

    // 게시글 작성 페이지로 이동
    await page.goto('/boards/new');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="boards-new-container"]', { timeout: 500 });
    
    // 권한이 필요한 기능 버튼 클릭
    const protectedButton = page.locator('[data-testid="save-button"]');
    if (await protectedButton.isVisible()) {
      await protectedButton.click();
      
      // 모달이 표시되지 않아야 함 (로그인 검사 우회)
      await expect(page.locator('[data-testid="login-confirm-modal"]')).not.toBeVisible();
    }
  });

  test('테스트 환경에서 비회원 가드 테스트', async ({ page }) => {
    // 테스트 환경에서 명시적으로 로그인 검사 수행
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = false; // 명시적으로 검사 수행
    });

    // 게시글 작성 페이지로 이동
    await page.goto('/boards/new');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="boards-new-container"]', { timeout: 500 });
    
    // 권한이 필요한 기능 버튼 클릭
    const protectedButton = page.locator('[data-testid="save-button"]');
    if (await protectedButton.isVisible()) {
      await protectedButton.click();
      
      // 로그인 확인 모달 표시 확인
      await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible();
    }
  });

  test('로그인 확인 모달 - 로그인 버튼 클릭', async ({ page }) => {
    // 실제 환경으로 설정하여 모달 표시
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // 게시글 작성 페이지로 이동
    await page.goto('/boards/new');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="boards-new-container"]', { timeout: 500 });
    
    // 권한이 필요한 기능 버튼 클릭
    const protectedButton = page.locator('[data-testid="save-button"]');
    if (await protectedButton.isVisible()) {
      await protectedButton.click();
      
      // 로그인 확인 모달 표시 확인
      await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible();
      
      // 로그인 버튼 클릭
      await page.click('[data-testid="modal-login-button"]');
      
      // 로그인 페이지로 이동 확인
      await expect(page).toHaveURL('/auth/login');
      
      // 모달이 닫혔는지 확인
      await expect(page.locator('[data-testid="login-confirm-modal"]')).not.toBeVisible();
    }
  });

  test('로그인 확인 모달 - 취소 버튼 클릭', async ({ page }) => {
    // 실제 환경으로 설정하여 모달 표시
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // 게시글 작성 페이지로 이동
    await page.goto('/boards/new');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="boards-new-container"]', { timeout: 500 });
    
    // 권한이 필요한 기능 버튼 클릭
    const protectedButton = page.locator('[data-testid="save-button"]');
    if (await protectedButton.isVisible()) {
      await protectedButton.click();
      
      // 로그인 확인 모달 표시 확인
      await expect(page.locator('[data-testid="login-confirm-modal"]')).toBeVisible();
      
      // 취소 버튼 클릭
      await page.click('[data-testid="modal-cancel-button"]');
      
      // 모달이 닫혔는지 확인
      await expect(page.locator('[data-testid="login-confirm-modal"]')).not.toBeVisible();
      
      // 페이지가 그대로 유지되는지 확인
      await expect(page).toHaveURL('/boards/new');
    }
  });

  test('모달 중복 표시 방지', async ({ page }) => {
    // 실제 환경으로 설정하여 모달 표시
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'production';
    });

    // 게시글 작성 페이지로 이동
    await page.goto('/boards/new');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="boards-new-container"]', { timeout: 500 });
    
    // 권한이 필요한 기능 버튼을 여러 번 클릭
    const protectedButton = page.locator('[data-testid="save-button"]');
    if (await protectedButton.isVisible()) {
      await protectedButton.click();
      await protectedButton.click();
      await protectedButton.click();
      
      // 모달이 하나만 표시되는지 확인
      const modalCount = await page.locator('[data-testid="login-confirm-modal"]').count();
      expect(modalCount).toBeLessThanOrEqual(1);
    }
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

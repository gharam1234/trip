import { test, expect } from '@playwright/test';

// 비로그인 유저 테스트 시나리오
test.describe('비로그인 유저 인증 테스트', () => {
  test('비회원으로 /boards에 접속하여 페이지 로드 확인', async ({ page }) => {
    // /boards 페이지로 이동
    await page.goto('/boards');
    
    // 페이지 로드 확인 (data-testid 기반)
    await expect(page.locator('[data-testid="layout-container"]')).toBeVisible();
    
    // boards 페이지 컨텐츠 로드 확인
    await expect(page.locator('[data-testid="boards-container"]')).toBeVisible();
  });

  test('layout의 로그인버튼 노출여부 확인', async ({ page }) => {
    await page.goto('/boards');
    
    // 로그인 버튼이 노출되는지 확인 (data-testid 기반)
    await expect(page.locator('[data-testid="layout-login-button"]')).toBeVisible();
  });

  test('로그인버튼 클릭하여 /auth/login 페이지로 이동', async ({ page }) => {
    await page.goto('/boards');
    
    // 로그인 버튼 클릭 (레이아웃의 로그인 버튼)
    await page.click('[data-testid="layout-login-button"]');
    
    // /auth/login 페이지로 이동 확인
    await expect(page).toHaveURL('/auth/login');
    
    // 로그인 페이지 로드 확인
    await expect(page.locator('[data-testid="login-container"]')).toBeVisible();
  });
});

// 로그인 유저 테스트 시나리오
test.describe('로그인 유저 인증 테스트', () => {
  test('비회원으로 /auth/login에 접속하여 페이지 로드 확인', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 로그인 페이지 로드 확인
    await expect(page.locator('[data-testid="login-container"]')).toBeVisible();
  });

  test('로그인 시도 및 성공', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 이메일 입력
    await page.fill('input[type="email"]', '123123@123123.com');
    
    // 비밀번호 입력
    await page.fill('input[type="password"]', 'qwer1234');
    
    // 로그인 버튼 클릭 (data-testid 사용)
    await page.click('[data-testid="login-button"]');
    
    // 로그인 성공 모달 대기 및 확인
    await expect(page.locator('[data-testid="login-success-modal"]')).toBeVisible();
  });

  test('로그인 성공 후 완료 모달 클릭하여 /boards 페이지 로드 확인', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 로그인 수행
    await page.fill('input[type="email"]', '123123@123123.com');
    await page.fill('input[type="password"]', 'qwer1234');
    await page.click('[data-testid="login-button"]');
    
    // 로그인 성공 모달 대기
    await expect(page.locator('[data-testid="login-success-modal"]')).toBeVisible();
    
    // 완료 버튼 클릭 (data-testid 사용)
    await page.click('[data-testid="modal-confirm-button"]');
    
    // /boards 페이지로 이동 확인
    await expect(page).toHaveURL('/boards');
    await expect(page.locator('[data-testid="boards-container"]')).toBeVisible();
  });

  test('layout에서 유저이름, 셀렉트박스버튼 노출여부 확인', async ({ page }) => {
    // 로그인 수행
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', '123123@123123.com');
    await page.fill('input[type="password"]', 'qwer1234');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-success-modal"]')).toBeVisible();
    await page.click('[data-testid="modal-confirm-button"]');
    
    // /boards 페이지로 이동되고 인증 정보 저장됨
    await expect(page).toHaveURL('/boards');
    await expect(page.locator('[data-testid="layout-container"]')).toBeVisible();
    
    // 로그인 상태에서 유저이름과 드롭다운 버튼이 노출되는지 확인
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-dropdown"]')).toBeVisible();
  });

  test('셀렉트박스를 열어서 로그아웃버튼 클릭하여 /auth/login 페이지 로드 확인', async ({ page }) => {
    // 로그인 수행
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', '123123@123123.com');
    await page.fill('input[type="password"]', 'qwer1234');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-success-modal"]')).toBeVisible();
    await page.click('[data-testid="modal-confirm-button"]');
    
    // /boards 페이지로 이동
    await expect(page).toHaveURL('/boards');
    
    // 드롭다운 버튼 클릭
    await page.click('[data-testid="user-dropdown"]');
    
    // 로그아웃 버튼 클릭
    await page.click('text=로그아웃');
    
    // /auth/login 페이지로 이동 확인
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('[data-testid="login-container"]')).toBeVisible();
  });

  test('로그아웃 후 /boards에 접속하여 페이지 로드 확인', async ({ page }) => {
    // 로그인 후 로그아웃 수행
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', '123123@123123.com');
    await page.fill('input[type="password"]', 'qwer1234');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-success-modal"]')).toBeVisible();
    await page.click('[data-testid="modal-confirm-button"]');
    await expect(page).toHaveURL('/boards');
    
    // 로그아웃 수행
    await page.click('[data-testid="user-dropdown"]');
    await page.click('text=로그아웃');
    await expect(page).toHaveURL('/auth/login');
    
    // /boards에 접속하여 페이지 로드 확인
    await page.goto('/boards');
    await expect(page.locator('[data-testid="layout-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="boards-container"]')).toBeVisible();
  });

  test('로그아웃 후 layout에 로그인버튼 노출여부 확인', async ({ page }) => {
    // 로그인 후 로그아웃 수행
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', '123123@123123.com');
    await page.fill('input[type="password"]', 'qwer1234');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-success-modal"]')).toBeVisible();
    await page.click('[data-testid="modal-confirm-button"]');
    await expect(page).toHaveURL('/boards');
    
    // 로그아웃 수행
    await page.click('[data-testid="user-dropdown"]');
    await page.click('text=로그아웃');
    await expect(page).toHaveURL('/auth/login');
    
    // /boards에 접속하여 로그인 버튼이 노출되는지 확인
    await page.goto('/boards');
    await expect(page.locator('[data-testid="layout-login-button"]')).toBeVisible();
  });
});

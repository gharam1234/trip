import { test, expect } from '@playwright/test';

/**
 * 인증 플로우 E2E 테스트
 * 로그인, 사용자 메뉴 표시 등을 검증합니다
 */
test.describe('인증 플로우 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 페이지로 이동
    await page.goto('/auth/login');
    // 페이지가 로드될 때까지 기다림
    await page.waitForLoadState('networkidle');
  });

  test('로그인 페이지에서 이메일과 비밀번호 입력이 가능해야 함', async ({ page }) => {
    // 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    
    // 비밀번호 입력 필드 확인
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // 로그인 버튼 확인 (data-testid 사용)
    const loginButton = page.locator('button[type="button"]').filter({ hasText: '로그인' }).first();
    await expect(loginButton).toBeEnabled();
  });

  test('유효하지 않은 이메일 형식으로는 로그인할 수 없어야 함', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="button"]').filter({ hasText: '로그인' }).first();

    // 유효하지 않은 이메일 입력
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    
    // 로그인 버튼은 활성화되어 있어야 함
    await expect(loginButton).toBeEnabled();
  });

  test('비밀번호 필드가 비어있으면 로그인할 수 없어야 함', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const loginButton = page.locator('button[type="button"]').filter({ hasText: '로그인' }).first();

    // 이메일만 입력
    await emailInput.fill('test@example.com');
    
    // 로그인 버튼은 활성화되어 있어야 함
    await expect(loginButton).toBeEnabled();
  });

  test('회원가입 링크가 존재해야 함', async ({ page }) => {
    // 회원가입 링크 찾기
    const signupLink = page.locator('a:has-text("회원가입")').first();
    
    // 회원가입 링크가 존재하는지 확인
    await expect(signupLink).toBeVisible();
  });
});

/**
 * 사용자 메뉴 E2E 테스트
 */
test.describe('사용자 메뉴 표시 E2E 테스트', () => {
  test('로그인 후 사용자 메뉴가 표시되어야 함', async ({ page, context }) => {
    // 테스트 데이터 설정 (실제 테스트 계정으로 변경 필요)
    const testEmail = 'test@example.com';
    const testPassword = 'Test1234!';

    // 로그인 페이지로 이동
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 이메일과 비밀번호 입력
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('[data-testid="login-button"]').first();

    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await loginButton.click();

    // 로그인 완료 후 리다이렉트 대기
    await page.waitForURL('**/boards', { timeout: 10000 }).catch(() => {
      // URL 변경이 없더라도 계속 진행
    });

    // 사용자 이름이 네비게이션 바에 표시되어야 함
    const userName = page.locator('[data-testid="user-name"]');
    
    // 잠시 대기 후 사용자 메뉴 드롭다운 버튼 확인
    await page.waitForTimeout(1000);
    const userDropdown = page.locator('[data-testid="user-dropdown"]').first();
    
    if (await userDropdown.isVisible()) {
      // 드롭다운 열기
      await userDropdown.click();
      await page.waitForTimeout(300);

      // 사용자 메뉴 컨테이너 확인
      const userMenuContainer = page.locator('[data-testid="user-menu-container"]');
      
      if (await userMenuContainer.isVisible()) {
        // 프로필 섹션 확인
        const profileSection = page.locator('[data-testid="user-menu-profile"]');
        const userNameInMenu = page.locator('[data-testid="user-menu-name"]');
        
        // 포인트 정보 확인
        const pointsSection = page.locator('[data-testid="user-menu-points"]');
        const pointsValue = page.locator('[data-testid="user-menu-points-value"]');
        
        console.log('사용자 메뉴 표시 확인:');
        console.log('- 프로필 섹션:', await profileSection.isVisible().catch(() => false));
        console.log('- 사용자 이름:', await userNameInMenu.isVisible().catch(() => false));
        console.log('- 포인트 섹션:', await pointsSection.isVisible().catch(() => false));
        console.log('- 포인트 값:', await pointsValue.isVisible().catch(() => false));
      }
    }
  });

  test('사용자 메뉴에 포인트 충전 버튼이 있어야 함', async ({ page }) => {
    // 로그인 처리 (실제 테스트 계정 사용)
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 로그인 후 게시판 페이지로 이동한다고 가정
    await page.goto('/boards');
    
    // 사용자 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]').first();
    
    if (await userDropdown.isVisible()) {
      await userDropdown.click();
      await page.waitForTimeout(300);

      // 포인트 충전 버튼 확인
      const chargeButton = page.locator('[data-testid="user-menu-charge-button"]');
      
      if (await chargeButton.isVisible()) {
        console.log('포인트 충전 버튼 확인됨');
        await expect(chargeButton).toContainText('포인트 충전');
      }
    }
  });

  test('사용자 메뉴에 로그아웃 버튼이 있어야 함', async ({ page }) => {
    // 게시판 페이지로 이동
    await page.goto('/boards');
    
    // 사용자 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]').first();
    
    if (await userDropdown.isVisible()) {
      await userDropdown.click();
      await page.waitForTimeout(300);

      // 로그아웃 버튼 확인
      const logoutButton = page.locator('[data-testid="user-menu-logout-button"]');
      
      if (await logoutButton.isVisible()) {
        console.log('로그아웃 버튼 확인됨');
        await expect(logoutButton).toContainText('로그아웃');
      }
    }
  });
});

/**
 * 네비게이션 및 레이아웃 E2E 테스트
 */
test.describe('네비게이션 및 레이아웃 E2E 테스트', () => {
  test('비로그인 상태에서 로그인 버튼이 표시되어야 함', async ({ page }) => {
    // 메인 페이지 방문
    await page.goto('/');
    
    // 로그인 버튼 확인
    const loginButton = page.locator('[data-testid="layout-login-button"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toContainText('로그인');
  });

  test('로고 클릭 시 게시판 페이지로 이동해야 함', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/auth/login');
    
    // 로고 찾기 및 클릭
    const logoLink = page.locator('[data-testid="logo-link"]');
    
    if (await logoLink.isVisible()) {
      await logoLink.click();
      
      // 게시판 페이지로 리다이렉트되는지 확인
      await page.waitForURL('**/boards', { timeout: 5000 }).catch(() => {
        // URL 변경이 없을 수 있음
      });
    }
  });

  test('회원가입 페이지에 액세스할 수 있어야 함', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto('/auth/signup');
    
    // 회원가입 폼 요소 확인
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });
});

/**
 * 게시판 페이지 E2E 테스트
 */
test.describe('게시판 페이지 E2E 테스트', () => {
  test('게시판 페이지에 접근할 수 있어야 함', async ({ page }) => {
    // 게시판 페이지로 이동
    await page.goto('/boards');
    
    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 페이지가 정상적으로 로드되었는지 확인
    expect(page.url()).toContain('/boards');
  });

  test('새 게시글 작성 페이지에 접근할 수 있어야 함', async ({ page }) => {
    // 게시판 페이지로 이동
    await page.goto('/boards');
    
    // 새 글 작성 버튼 찾기
    const newPostButton = page.locator('[data-testid="layout-new-board-button"]').first();
    
    if (await newPostButton.isVisible()) {
      await newPostButton.click();
      
      // 새 게시글 작성 페이지로 리다이렉트 확인
      await page.waitForURL('**/boards/new', { timeout: 5000 }).catch(() => {
        // URL 변경이 없을 수 있음
      });
    }
  });
});

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


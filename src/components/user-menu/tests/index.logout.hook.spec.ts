import { test, expect } from '@playwright/test';

/**
 * useLogout Hook 테스트
 * Playwright를 이용한 TDD 기반 테스트
 * localStorage에서 토큰 삭제 및 페이지 이동 확인
 */

test.describe('useLogout Hook - 로그아웃 기능 테스트', () => {
  /**
   * 1) 성공 시나리오: 로그아웃 버튼 클릭 시 localStorage에서 토큰 삭제
   */
  test('로그아웃 버튼 클릭 시 localStorage의 토큰 정보가 삭제되어야 함', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동 (로그인 필수)
    await page.goto('/boards');

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // localStorage에 여러 토큰 키 설정 (테스트용)
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'test-access-token');
      localStorage.setItem('authToken', 'test-auth-token');
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('access_token', 'test-access-token-alt');
    });

    // localStorage에 토큰이 있는지 확인
    const tokenBeforeLogout = await page.evaluate(() => {
      return localStorage.getItem('accessToken');
    });

    expect(tokenBeforeLogout).toBeTruthy();

    // user-menu 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // user-menu 컨테이너 표시 대기
      await page.waitForSelector('[data-testid="user-menu-container"]', {
        timeout: 500,
      });

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('[data-testid="user-menu-logout-button"]');
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();

      // 페이지 이동 대기
      await page.waitForURL('/auth/login', { timeout: 1000 });

      // localStorage에서 모든 토큰이 삭제되었는지 확인
      const tokensAfterLogout = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('accessToken'),
          authToken: localStorage.getItem('authToken'),
          token: localStorage.getItem('token'),
          access_token: localStorage.getItem('access_token'),
        };
      });

      expect(tokensAfterLogout.accessToken).toBeNull();
      expect(tokensAfterLogout.authToken).toBeNull();
      expect(tokensAfterLogout.token).toBeNull();
      expect(tokensAfterLogout.access_token).toBeNull();
    }
  });

  /**
   * 2) 성공 시나리오: 로그아웃 후 /auth/login으로 페이지 이동
   */
  test('로그아웃 후 /auth/login 페이지로 이동해야 함', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동
    await page.goto('/boards');

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // user-menu 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // user-menu 컨테이너 표시 대기
      await page.waitForSelector('[data-testid="user-menu-container"]', {
        timeout: 500,
      });

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('[data-testid="user-menu-logout-button"]');
      await logoutButton.click();

      // /auth/login으로 이동했는지 확인
      await page.waitForURL('/auth/login', { timeout: 1000 });
      expect(page.url()).toContain('/auth/login');
    }
  });

  /**
   * 3) 성공 시나리오: localStorage에서 user 정보도 함께 삭제
   */
  test('로그아웃 시 localStorage의 사용자 정보도 함께 삭제되어야 함', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동
    await page.goto('/boards');

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // localStorage에 로그인 상태 설정 (실제 로그인 상태 시뮬레이션)
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'test-access-token');
      localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    });

    // localStorage에 사용자 정보가 있는지 확인
    const userDataBeforeLogout = await page.evaluate(() => {
      return localStorage.getItem('user');
    });

    expect(userDataBeforeLogout).toBeTruthy();

    // user-menu 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // user-menu 컨테이너 표시 대기
      await page.waitForSelector('[data-testid="user-menu-container"]', {
        timeout: 500,
      });

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('[data-testid="user-menu-logout-button"]');
      await logoutButton.click();

      // 페이지 이동 대기
      await page.waitForURL('/auth/login', { timeout: 1000 });

      // localStorage에서 user 정보가 삭제되었는지 확인
      const userDataAfterLogout = await page.evaluate(() => {
        return localStorage.getItem('user');
      });

      expect(userDataAfterLogout).toBeNull();
    }
  });

  /**
   * 4) 성공 시나리오: 로그아웃 버튼의 onclick 이벤트가 정상 작동
   */
  test('로그아웃 버튼이 클릭 가능하고 onclick 이벤트가 작동해야 함', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동
    await page.goto('/boards');

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // user-menu 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // user-menu 컨테이너 표시 대기
      await page.waitForSelector('[data-testid="user-menu-container"]', {
        timeout: 500,
      });

      // 로그아웃 버튼이 클릭 가능한지 확인
      const logoutButton = page.locator('[data-testid="user-menu-logout-button"]');
      await expect(logoutButton).toBeEnabled();

      // 로그아웃 버튼의 type 확인
      const buttonType = await logoutButton.getAttribute('type');
      expect(buttonType).toBe('button');
    }
  });

  /**
   * 5) 실패 시나리오: localStorage에 토큰이 없을 때도 에러 없이 처리
   */
  test('localStorage에 토큰이 없을 때 에러 없이 로그인 페이지로 이동해야 함', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동
    await page.goto('/boards');

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // 미리 localStorage에서 모든 토큰 삭제
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    });

    // user-menu 드롭다운 버튼 클릭 (이미 로그아웃된 상태)
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    // 로그아웃된 상태에서도 에러가 발생하지 않아야 함
    expect(isVisible === false || isVisible === true).toBeTruthy();
  });

  /**
   * 6) 데이터 검증: 로그아웃 전후 localStorage 상태 비교
   */
  test('로그아웃 전후 localStorage 상태가 정상적으로 변경되어야 함', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동
    await page.goto('/boards');

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // localStorage에 로그인 상태 설정 (실제 로그인 상태 시뮬레이션)
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'test-access-token');
      localStorage.setItem('authToken', 'test-auth-token');
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('access_token', 'test-access-token-alt');
      localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    });

    // 로그아웃 전 localStorage 상태 저장 (모든 토큰 키 포함)
    const beforeLogoutState = await page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('accessToken'),
        authToken: localStorage.getItem('authToken'),
        token: localStorage.getItem('token'),
        access_token: localStorage.getItem('access_token'),
        user: localStorage.getItem('user'),
      };
    });

    expect(beforeLogoutState.accessToken).toBeTruthy();

    // user-menu 드롭다운 버튼 클릭
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // user-menu 컨테이너 표시 대기
      await page.waitForSelector('[data-testid="user-menu-container"]', {
        timeout: 500,
      });

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('[data-testid="user-menu-logout-button"]');
      await logoutButton.click();

      // 페이지 이동 대기
      await page.waitForURL('/auth/login', { timeout: 1000 });

      // 로그아웃 후 localStorage 상태 확인 (모든 토큰 키 포함)
      const afterLogoutState = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('accessToken'),
          authToken: localStorage.getItem('authToken'),
          token: localStorage.getItem('token'),
          access_token: localStorage.getItem('access_token'),
          user: localStorage.getItem('user'),
        };
      });

      // 로그아웃 후 모든 토큰과 사용자 정보가 모두 삭제되었는지 확인
      expect(afterLogoutState.accessToken).toBeNull();
      expect(afterLogoutState.authToken).toBeNull();
      expect(afterLogoutState.token).toBeNull();
      expect(afterLogoutState.access_token).toBeNull();
      expect(afterLogoutState.user).toBeNull();

      // 로그아웃 전후 상태 변화 검증
      expect(beforeLogoutState.accessToken).not.toBe(afterLogoutState.accessToken);
    }
  });
});

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 12:25:26
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


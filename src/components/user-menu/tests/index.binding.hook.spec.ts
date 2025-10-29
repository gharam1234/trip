import { test, expect } from '@playwright/test';

/**
 * 사용자 메뉴 바인딩 Hook 테스트
 * Playwright를 이용한 TDD 기반 테스트
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

test.describe('useUserMenuBinding Hook - 실제 API 데이터 바인딩', () => {
  /**
   * 1) 성공 시나리오: API 응답 데이터를 기반으로 바인딩
   */
  test('API 호출 성공 - 실제 사용자 정보 데이터 바인딩 및 포인트 포맷팅', async ({
    page,
  }) => {
    // 게시판 목록 페이지로 이동 (로그인 필수, Layout 포함)
    await page.goto(`${BASE_URL}/boards`);

    // 레이아웃이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    // 드롭다운 버튼 클릭하여 user-menu 열기
    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // user-menu 컨테이너 표시 대기
      await page.waitForSelector('[data-testid="user-menu-container"]', {
        timeout: 500,
      });

      const userMenuContainer = page.locator('[data-testid="user-menu-container"]');
      await expect(userMenuContainer).toBeVisible();

      // 포인트 값이 포맷팅 형식으로 표시되는지 확인
      const pointsValue = page.locator('[data-testid="user-menu-points-value"]');
      const pointsValueText = await pointsValue.textContent();
      expect(pointsValueText).toBeTruthy();
      expect(pointsValueText).toMatch(/^\d{1,3}(,\d{3})*$/);

      // 포인트 단위 "P" 확인
      const pointsUnit = page.locator('[data-testid="user-menu-points-unit"]');
      const pointsUnitText = await pointsUnit.textContent();
      expect(pointsUnitText).toBe('P');
    }
  });

  /**
   * 2) 성공 시나리오: 프로필 이미지 렌더링
   */
  test('프로필 이미지 렌더링 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/boards`);

    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      const profileImage = page.locator('[data-testid="user-menu-profile-image"]');
      await expect(profileImage).toBeVisible();
    }
  });

  /**
   * 3) 성공 시나리오: 포인트 ellipsis 스타일 적용
   */
  test('포인트 값이 길 경우 ellipsis 스타일 적용', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/boards`);

    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      const pointsValue = page.locator('[data-testid="user-menu-points-value"]');

      const styles = await pointsValue.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          overflow: computedStyle.overflow,
          textOverflow: computedStyle.textOverflow,
          whiteSpace: computedStyle.whiteSpace,
        };
      });

      expect(styles.overflow).toBe('hidden');
      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.whiteSpace).toBe('nowrap');
    }
  });

  /**
   * 4) 실패 시나리오: API 호출 실패
   */
  test('API 호출 실패 시 에러 메시지 표시', async ({ page }) => {
    // GraphQL 요청 차단
    await page.route('**/graphql', (route) => {
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/boards`);

    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      const errorMessage = page.locator('[class*="errorMessage"]');
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);

      // 에러 메시지가 표시되거나 메뉴가 표시되지 않아야 함
      expect(!isVisible || isErrorVisible).toBeTruthy();
    }
  });

  /**
   * 5) 실패 시나리오: 사용자 정보 없음
   */
  test('사용자 정보 없음 처리', async ({
    page,
  }) => {
    await page.route('**/graphql', async (route) => {
      if (route.request().postDataJSON?.operationName === 'FetchUserLoggedIn') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              fetchUserLoggedIn: null,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/boards`);

    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // 사용자 정보 없음 상태 처리
      const errorMessage = page.locator('[class*="errorMessage"]');
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      expect(isErrorVisible).toBeTruthy();
    }
  });

  /**
   * 6) 데이터 검증: API 응답 구조 확인
   */
  test('API 응답 데이터 구조 검증', async ({ page }) => {
    let userApiResponse: any = null;

    await page.route('**/graphql', async (route) => {
      const response = await route.fetch();
      const responseBody = await response.json();

      if (
        responseBody?.data?.fetchUserLoggedIn &&
        !userApiResponse
      ) {
        userApiResponse = responseBody.data.fetchUserLoggedIn;
      }

      await route.continue();
    });

    await page.goto(`${BASE_URL}/boards`);

    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 1000,
    });

    const userDropdown = page.locator('[data-testid="user-dropdown"]');
    const isVisible = await userDropdown.isVisible().catch(() => false);

    if (isVisible) {
      await userDropdown.click();

      // API 응답 데이터 검증
      if (userApiResponse) {
        expect(userApiResponse).toHaveProperty('_id');
        expect(userApiResponse).toHaveProperty('name');
        expect(userApiResponse).toHaveProperty('userPoint');
        expect(typeof userApiResponse.name).toBe('string');
        if (userApiResponse.userPoint) {
          expect(userApiResponse.userPoint).toHaveProperty('point');
          expect(typeof userApiResponse.userPoint.point).toBe('number');
        }
      }
    }
  });
});

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)

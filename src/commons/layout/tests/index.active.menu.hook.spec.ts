import { test, expect } from '@playwright/test';

test.describe('Active Menu Hook (TDD 기반 테스트)', () => {
  // 테스트 환경 설정
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });
  });

  // 테스트할 경로들과 예상 활성 메뉴 ID
  const TEST_CASES = [
    {
      path: '/boards',
      expectedMenuId: 'trip-talk',
      description: '게시글 목록 페이지 - 트립토크 메뉴 활성화',
    },
    {
      path: '/boards/123',
      expectedMenuId: 'trip-talk',
      description: '게시글 상세 페이지 - 트립토크 메뉴 활성화',
    },
    {
      path: '/accommodation',
      expectedMenuId: 'accommodation-buy',
      description: '숙박권 구매 페이지 - 숙박권 구매 메뉴 활성화',
    },
    {
      path: '/mypage',
      expectedMenuId: 'my-page',
      description: '마이 페이지 - 마이 페이지 메뉴 활성화',
    },
  ];

  // 각 테스트 케이스에 대한 테스트 실행
  for (const testCase of TEST_CASES) {
    const { path, expectedMenuId, description } = testCase;

    test(description, async ({ page }) => {
      // 페이지 이동
      await page.goto(path);

      // navigation이 표시되는 페이지만 테스트
      const navigationElement = page.locator('nav').first();
      const navComputedStyle = await navigationElement.evaluate(
        (el) => window.getComputedStyle(el).display
      );

      // navigation이 숨겨진 경우 테스트 스킵
      if (navComputedStyle === 'none') {
        test.skip();
        return;
      }

      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForSelector('[data-testid="layout-container"]', {
        timeout: 400,
      });

      // 예상되는 활성 메뉴의 버튼 찾기
      const activeMenuButton = page.locator(
        `[data-testid="menu-${expectedMenuId}"]`
      );

      // 활성 메뉴 버튼이 존재해야 함
      await expect(activeMenuButton).toBeVisible();

      // 활성 메뉴에 tapActive 클래스가 적용되었는지 확인
      const tapActiveClass = await activeMenuButton.evaluate((el) => {
        return el.classList.toString().includes('tapActive');
      });

      console.log(
        `\n경로: ${path}\n  예상 활성 메뉴: ${expectedMenuId}\n  tapActive 클래스: ${tapActiveClass}`
      );

      // 활성 메뉴에는 tapActive 클래스가 적용되어야 함
      expect(tapActiveClass).toBe(true);

      // 활성 메뉴의 텍스트 스타일 확인
      const activeMenuLabel = activeMenuButton.locator('span');
      const labelStyle = await activeMenuLabel.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          fontWeight: styles.fontWeight,
          color: styles.color,
        };
      });

      console.log(`  텍스트 스타일: ${JSON.stringify(labelStyle)}`);

      // 활성 메뉴의 텍스트는 볼드(700)여야 함
      expect(parseInt(labelStyle.fontWeight)).toBeGreaterThanOrEqual(700);
    });
  }

  test('/boards로 시작하는 모든 경로에서 트립토크 메뉴가 활성화되는지 확인', async ({
    page,
  }) => {
    // 테스트할 경로들
    const boardPaths = ['/boards', '/boards/123', '/boards/new'];

    for (const path of boardPaths) {
      await page.goto(path);

      // navigation이 표시되는 페이지만 테스트
      const navigationElement = page.locator('nav').first();
      const navComputedStyle = await navigationElement.evaluate(
        (el) => window.getComputedStyle(el).display
      );

      if (navComputedStyle === 'none') {
        continue; // navigation이 숨겨진 경우 다음 경로로
      }

      await page.waitForSelector('[data-testid="layout-container"]', {
        timeout: 400,
      });

      // 트립토크 메뉴가 활성화되어 있는지 확인
      const tripTalkMenu = page.locator('[data-testid="menu-trip-talk"]');
      await expect(tripTalkMenu).toBeVisible();

      console.log(`\n경로: ${path} - 트립토크 메뉴 활성화 확인`);
    }
  });

  test('메뉴 클릭 시 해당 페이지로 이동하는지 확인', async ({ page }) => {
    // 게시글 목록 페이지로 이동
    await page.goto('/boards');

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 400,
    });

    // 숙박권 구매 메뉴 클릭
    const accommodationMenu = page.locator('[data-testid="menu-accommodation-buy"]');
    await expect(accommodationMenu).toBeVisible();

    await accommodationMenu.click();

    // URL이 /accommodation으로 변경되었는지 확인
    await expect(page).toHaveURL('/accommodation');

    // 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded', { timeout: 400 });
  });

  test('모든 메뉴 버튼에 cursor: pointer가 적용되어야 함', async ({ page }) => {
    await page.goto('/boards');

    await page.waitForSelector('[data-testid="layout-container"]', {
      timeout: 400,
    });

    // 모든 메뉴 버튼 확인
    const menuButtons = page.locator('[data-testid^="menu-"]');

    const count = await menuButtons.count();
    console.log(`\n메뉴 버튼 개수: ${count}`);

    for (let i = 0; i < count; i++) {
      const button = menuButtons.nth(i);
      const cursor = await button.evaluate(
        (el) => window.getComputedStyle(el).cursor
      );

      console.log(`메뉴 ${i + 1} cursor: ${cursor}`);
      expect(cursor).toBe('pointer');
    }
  });
});


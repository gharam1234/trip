import { test, expect } from "@playwright/test";

// 테스트 skip 대상 경로들
const SKIP_PATHS = ["/auth/login", "/auth/signup", "/boards/[BoardId]/edit"];

// 테스트할 경로들과 예상 결과
const TEST_CASES = [
  // banner와 navigation 모두 표시되는 경로
  {
    path: "/boards",
    expectedBanner: true,
    expectedNavigation: true,
    description: "게시글 목록 페이지 - banner와 navigation 모두 표시",
  },
  {
    path: "/boards/123",
    expectedBanner: true,
    expectedNavigation: true,
    description: "게시글 상세 페이지 - banner와 navigation 모두 표시",
  },
  // banner와 navigation 모두 숨겨지는 경로
  {
    path: "/boards/new",
    expectedBanner: false,
    expectedNavigation: false,
    description: "게시글 작성 페이지 - banner와 navigation 모두 숨김",
  },
];

/**
 * SKIP_PATHS에 포함된 경로인지 확인하는 함수
 * 동적 세그먼트([])가 있는 경로도 정확하게 판단합니다.
 */
function shouldSkipPath(path: string): boolean {
  return SKIP_PATHS.some((skipPath) => {
    if (skipPath.includes("[") && skipPath.includes("]")) {
      // 동적 세그먼트가 있는 경로의 경우 패턴 매칭
      const pattern = skipPath
        .replace(/\[.*?\]/g, "[^/]+")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return skipPath === path;
  });
}

test.describe("Area Visibility Hook (TDD 기반 테스트)", () => {
  // 테스트 환경 설정
  test.beforeEach(async ({ page, context }) => {
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });
  });

  // 각 테스트 케이스에 대한 테스트 실행
  for (const testCase of TEST_CASES) {
    const { path, expectedBanner, expectedNavigation, description } = testCase;

    test(description, async ({ page }) => {
      // skip 대상 경로인지 확인
      if (shouldSkipPath(path)) {
        test.skip();
        return;
      }

      // 페이지 이동
      await page.goto(path);

      // 페이지가 완전히 로드될 때까지 대기 (data-testid 기반)
      // timeout은 500ms 미만으로 설정
      await page.waitForSelector("[data-testid='layout-container']", {
        timeout: 400,
      });

      // layout 컨테이너에서 hook의 상태 확인
      const layoutContainer = page.locator("[data-testid='layout-container']");
      const routeKey = await layoutContainer.getAttribute("data-route-key");
      const showBannerAttr = await layoutContainer.getAttribute(
        "data-show-banner"
      );
      const showNavigationAttr = await layoutContainer.getAttribute(
        "data-show-navigation"
      );

      console.log(
        `\n경로: ${path}\n  routeKey: ${routeKey}\n  showBanner: ${showBannerAttr}\n  showNavigation: ${showNavigationAttr}`
      );

      // 배너 영역 가시성 확인
      // display 속성을 직접 확인하여 보다 정확한 테스트 수행
      const bannerElement = page.locator(
        'section[aria-label="main visual banner"]'
      );
      const bannerComputedStyle = await bannerElement.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });

      console.log(`  banner display: ${bannerComputedStyle}`);

      if (expectedBanner) {
        // banner가 표시되어야 하는 경우
        expect(bannerComputedStyle).not.toBe("none");
        await expect(bannerElement).toBeVisible();
      } else {
        // banner가 숨겨져야 하는 경우
        expect(bannerComputedStyle).toBe("none");
        await expect(bannerElement).not.toBeVisible();
      }

      // 네비게이션 영역 가시성 확인
      // 첫 번째 nav 태그 (레이아웃의 네비게이션)만 선택
      const navigationElement = page.locator("nav").first();
      const navComputedStyle = await navigationElement.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });

      console.log(`  navigation display: ${navComputedStyle}`);

      if (expectedNavigation) {
        // navigation이 표시되어야 하는 경우
        expect(navComputedStyle).not.toBe("none");
        await expect(navigationElement).toBeVisible();
      } else {
        // navigation이 숨겨져야 하는 경우
        expect(navComputedStyle).toBe("none");
        await expect(navigationElement).not.toBeVisible();
      }
    });
  }

  // skip 대상 경로 정의 확인 테스트
  test("skip 대상 경로들이 정의되어 있는지 확인", () => {
    expect(SKIP_PATHS).toContain("/auth/login");
    expect(SKIP_PATHS).toContain("/auth/signup");
    expect(SKIP_PATHS).toContain("/boards/[BoardId]/edit");
  });

  // 동적 세그먼트 경로 매칭 테스트
  test("동적 세그먼트 경로 매칭 로직이 정확하게 작동하는지 확인", () => {
    // /boards/[BoardId]/edit 패턴 매칭 테스트
    expect(shouldSkipPath("/boards/123/edit")).toBe(true);
    expect(shouldSkipPath("/boards/abc/edit")).toBe(true);
    expect(shouldSkipPath("/boards/123")).toBe(false);

    // /auth/login, /auth/signup 테스트
    expect(shouldSkipPath("/auth/login")).toBe(true);
    expect(shouldSkipPath("/auth/signup")).toBe(true);
    expect(shouldSkipPath("/auth/logout")).toBe(false);
  });
});

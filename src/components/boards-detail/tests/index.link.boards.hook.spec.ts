import { test, expect } from "@playwright/test";

// 목록 버튼 클릭 시 /boards 로 이동하는지 검증
test.describe("보드 상세 - 목록으로 버튼 네비게이션", () => {
  test("버튼 클릭 전후 URL이 요구사항과 일치해야 함", async ({ page }) => {
    // 테스트 환경 플래그 주입 (기존 패턴과 일치)
    await page.addInitScript(() => {
      // @ts-ignore
      window.__TEST_ENV__ = 'test';
      // @ts-ignore
      window.__TEST_BYPASS__ = true;
    });

    // 사전: 페이지 로드 전 기본 홈으로 접근하여 스토리지 접근 가능화
    await page.goto("/");

    // 상세 페이지 렌더에 필요한 최소 게시글 데이터 주입
    await page.evaluate(() => {
      const TEST_BOARDS = [
        {
          boardId: "1",
          writer: "홍길동",
          password: "1234",
          title: "첫 번째 게시글",
          contents: "내용",
          youtubeUrl: "",
          boardAddress: { zipcode: "", address: "", addressDetail: "" },
          images: [],
          createdAt: "2024-01-01",
        },
      ];
      localStorage.setItem("boards", JSON.stringify(TEST_BOARDS));
    });

    // 1) 상세 페이지로 이동 (예: /boards/1)
    await page.goto("/boards/1");

    // 2) 페이지 로드 식별: data-testid 기반 대기
    // 페이지가 완전히 로드될 때까지 data-testid로 식별
    await page.waitForSelector('[data-testid="boards-detail-page"]', { state: 'visible', timeout: 1000 });

    // 3) 클릭 전 URL 확인
    await expect(page).toHaveURL(/\/boards\/1$/);

    // 4) 목록으로 버튼 클릭 - data-testid로 버튼 식별
    const listButton = page.locator('[data-testid="list-button"]');
    await expect(listButton).toBeVisible();

    // 버튼 클릭
    await listButton.click();

    // 5) 클릭 후 URL 확인: /boards 로 1000ms 이내 이동
    await expect(page).toHaveURL('/boards', { timeout: 2000 });
  });
});



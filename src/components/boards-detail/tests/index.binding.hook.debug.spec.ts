import { test, expect } from "@playwright/test";

/**
 * 디버그 테스트: 페이지 로드 상태 상세 확인
 */
test.describe("디버그: 페이지 로드 상세 확인", () => {
  test("페이지 로드 상태를 상세히 확인", async ({ page }) => {
    // 게시글 상세 페이지로 이동
    const response = await page.goto("/boards/1", { waitUntil: "domcontentloaded" });

    console.log("\n=== 페이지 로드 정보 ===");
    console.log("Response status:", response?.status());
    console.log("Page URL:", page.url());

    // 페이지 렌더링 대기 추가 (React 렌더링 완료)
    await page.waitForTimeout(100);

    // 모든 data-testid 요소 찾기
    const testIds = await page.locator("[data-testid]").all();
    console.log("\n=== Data TestId 요소 ===");
    console.log("총 요소 개수:", testIds.length);

    for (const element of testIds.slice(0, 10)) {
      const testId = await element.getAttribute("data-testid");
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      console.log(`  - ${tagName} [data-testid="${testId}"] text: "${text?.substring(0, 50)}..."`);
    }

    // 페이지 내용 텍스트 확인
    const bodyText = await page.locator("body").textContent();
    console.log("\n=== Body 텍스트 (처음 300자) ===");
    console.log(bodyText?.substring(0, 300));

    // 특정 요소 확인
    const boardDetailPage = page.locator('[data-testid="boards-detail-page"]');
    const isVisible = await boardDetailPage.isVisible().catch(() => false);
    console.log("\n=== boards-detail-page 요소 ===");
    console.log("isVisible:", isVisible);
    console.log("count:", await boardDetailPage.count());

    const content = await boardDetailPage.textContent();
    console.log("content:", content?.substring(0, 200));

    expect(true).toBe(true);
  });
});

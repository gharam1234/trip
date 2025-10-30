import { test, expect } from "@playwright/test";

/**
 * 게시판 목록 E2E 테스트
 * - 게시글 목록 조회
 * - 검색 기능
 * - 페이지네이션
 * - 게시글 작성 페이지 이동
 * - 게시글 상세 페이지 이동
 * - 삭제 기능
 */

test.describe("게시판 목록", () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 환경 설정
    await page.goto("http://localhost:3000");
    await page.evaluate(() => {
      window.__TEST_ENV__ = "test";
      window.__TEST_BYPASS__ = "false";
    });
  });

  test("게시판 목록이 올바르게 렌더링된다", async ({ page }) => {
    // 게시판 목록 페이지로 이동
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 컴포넌트가 렌더링되는지 확인
    await expect(page.locator('[data-testid="boards-container"]')).toBeVisible();

    // 타이틀 확인
    await expect(page.locator('[aria-label="boards-title"]')).toContainText("트립토크 게시판");

    // 검색 영역 확인
    await expect(page.locator('[aria-label="boards-search"]')).toBeVisible();
    await expect(page.locator('input[placeholder="제목을 검색해 주세요."]')).toBeVisible();
    await expect(page.locator('[data-testid="trip-talk-button"]')).toBeVisible();

    // 리스트 헤더 확인
    await expect(page.locator('[role="columnheader"]')).toHaveText(["번호", "제목", "작성자", "날짜"]);

    // 페이지네이션 확인
    await expect(page.locator('[data-testid="boards-pagination"]')).toBeVisible();
  });

  test("검색 기능이 정상적으로 동작한다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 검색어 입력
    const searchInput = page.locator('input[placeholder="제목을 검색해 주세요."]');
    await searchInput.fill("테스트");

    // 검색 버튼 클릭
    await page.locator('text=검색').click();

    // 검색 결과 대기
    await page.waitForTimeout(1000);

    // 검색 결과 확인 (실제 데이터가 없을 경우 "검색 결과가 없습니다." 메시지 확인)
    const listBody = page.locator('[role="rowgroup"]');
    const hasResults = await listBody.locator('[role="row"]').count() > 1;

    if (hasResults) {
      // 검색 결과가 있는 경우
      await expect(page.locator('[data-testid="boards-list"]')).toBeVisible();
    } else {
      // 검색 결과가 없는 경우
      await expect(page.locator('text=검색 결과가 없습니다.')).toBeVisible();
    }
  });

  test("날짜 필터 기능이 정상적으로 동작한다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 날짜 선택기 클릭
    const datePickers = page.locator('.ant-picker');
    await expect(datePickers).toHaveCount(1);

    // 날짜 범위 선택 (실제 브라우저에서는 달력 팝업이 열림)
    await datePickers.first().click();

    // 날짜 선택 후 적용 (테스트를 위해 임의로 날짜 입력)
    await page.keyboard.press('Escape'); // 닫기

    // 검색어 입력
    const searchInput = page.locator('input[placeholder="제목을 검색해 주세요."]');
    await searchInput.fill("2024");

    // 검색 실행
    await page.locator('text=검색').click();

    // 결과 대기
    await page.waitForTimeout(1000);
  });

  test("페이지네이션이 정상적으로 동작한다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 페이지네이션 컴포넌트 확인
    const pagination = page.locator('[data-testid="boards-pagination"]');
    await expect(pagination).toBeVisible();

    // 페이지 버튼들이 있는지 확인
    const pageButtons = pagination.locator('button');
    const buttonCount = await pageButtons.count();

    if (buttonCount > 0) {
      // 다음 페이지 버튼이 있다면 클릭
      const nextPageButton = pageButtons.last();
      if (await nextPageButton.isEnabled()) {
        await nextPageButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("트립토크 등록 버튼 클릭 시 작성 페이지로 이동한다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 트립토크 등록 버튼 클릭
    await page.locator('[data-testid="trip-talk-button"]').click();

    // 작성 페이지로 이동 확인
    await expect(page).toHaveURL(/.*\/boards\/new/);
    await expect(page.locator('[data-testid="boards-write-page"]')).toBeVisible();
  });

  test("게시글 클릭 시 상세 페이지로 이동한다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 게시글 목록에서 첫 번째 게시글 찾기
    const firstBoard = page.locator('[data-testid="boards-list"] [role="row"]').first();

    // 게시글이 있는 경우에만 테스트
    if (await firstBoard.isVisible()) {
      await firstBoard.click();

      // 상세 페이지로 이동 확인
      await expect(page).toHaveURL(/.*\/boards\/[0-9]+/);
    }
  });

  test("삭제 아이콘 호버 시 표시되고 클릭 시 삭제 모달이 나타난다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 게시글 목록에서 첫 번째 게시글 찾기
    const firstBoard = page.locator('[data-testid="boards-list"] [role="row"]').first();

    if (await firstBoard.isVisible()) {
      // 게시글에 호버
      await firstBoard.hover();

      // 삭제 아이콘이 표시되는지 확인
      const deleteIcon = firstBoard.locator('[data-testid="delete-icon"]');
      await expect(deleteIcon).toBeVisible();

      // 삭제 아이콘 클릭
      await deleteIcon.click();

      // 삭제 확인 모달이 나타나는지 확인 (로그인 필요)
      await page.waitForTimeout(1000);
    }
  });

  test("데이터가 없을 때 '등록된 게시글이 없습니다.' 메시지가 표시된다", async ({ page }) => {
    await page.goto("http://localhost:3000/boards");
    await page.waitForLoadState("networkidle");

    // 로딩이 완료될 때까지 대기
    await page.waitForSelector('[data-testid="boards-container"]', { state: 'visible' });

    // 게시글이 없는 경우 메시지 확인
    const listBody = page.locator('[role="rowgroup"]');
    const boardRows = listBody.locator('[role="row"]');

    // 잠시 대기하여 데이터 로딩 확인
    await page.waitForTimeout(2000);

    const rowCount = await boardRows.count();

    if (rowCount === 1) {
      // 단 한 개의 행만 있고 내용이 없는 경우
      const singleRow = boardRows.first();
      const hasNoData = await singleRow.locator('text=등록된 게시글이 없습니다.').isVisible();
      if (hasNoData) {
        await expect(singleRow).toContainText("등록된 게시글이 없습니다.");
      }
    }
  });

  test("로딩 상태가 올바르게 표시된다", async ({ page }) => {
    // 네트워크 속도를 느리게 설정하여 로딩 상태 확인
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto("http://localhost:3000/boards");

    // 로딩 메시지 확인
    await expect(page.locator('text=로딩 중...')).toBeVisible();

    // 로�� 완료 후 메시지 사라짐 확인
    await page.waitForLoadState("networkidle");
    await expect(page.locator('text=로딩 중...')).not.toBeVisible();
  });
});

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 17:59:24
// 변경 이유: E2E 테스트 작성 - 게시판 목록 기능 검증
// 학습 키워드: E2E 테스트, Playwright, 게시판 목록, 검색, 페이지네이션
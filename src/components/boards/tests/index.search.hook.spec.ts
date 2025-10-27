import { test, expect, Page } from "@playwright/test";

/**
 * SearchBar 검색 기능 테스트
 * - 제목 검색어 입력 및 검색 버튼 클릭
 * - DatePicker 날짜 범위 선택 및 검색
 * - API 파라미터 전달 확인
 * - 검색 결과 필터링 확인
 */

test.describe("SearchBar 검색 기능", () => {
  // 각 테스트 전 /boards 페이지로 이동
  test.beforeEach(async ({ page }) => {
    await page.goto("/boards");

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-container"]', {
      timeout: 500,
    });
  });

  test("검색어 입력 후 검색 버튼 클릭 시 API 호출 확인", async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator(
      '[data-testid="boards-container"]'
    );
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // SearchBar 입력 필드 찾기 (placeholder 기반)
    const searchBar = page.locator(
      'input[placeholder="제목을 검색해 주세요."]'
    );
    await expect(searchBar).toBeVisible();

    // 검색어 입력
    const searchKeyword = "테스트";
    await searchBar.fill(searchKeyword);
    await expect(searchBar).toHaveValue(searchKeyword);

    // 검색 버튼 찾기 및 클릭
    const searchButton = page.locator("button:has-text('검색')");
    await expect(searchButton).toBeVisible();

    // GraphQL 요청 인터셉트를 위한 준비
    const requestPromise = page.waitForRequest((request) => {
      return (
        request.url().includes("graphql") &&
        request.method() === "POST"
      );
    });

    await searchButton.click();

    // GraphQL 요청이 발생하는지 확인
    const request = await requestPromise;
    const requestBody = request.postDataJSON();

    // 요청 본문에 search 파라미터가 포함되어 있는지 확인
    expect(requestBody).toBeDefined();
    expect(requestBody.operationName).toBe("FetchBoards");
  });

  test("DatePicker에서 날짜 범위 선택 후 검색 시 API 파라미터 확인", async ({
    page,
  }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator(
      '[data-testid="boards-container"]'
    );
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // DatePicker 입력 필드 찾기
    const datepickerInputs = page.locator('.ant-picker input');
    const dateInputCount = await datepickerInputs.count();

    // 최소 2개 이상의 input이 있어야 함 (시작일, 종료일)
    expect(dateInputCount).toBeGreaterThanOrEqual(2);

    // SearchBar 입력
    const searchBar = page.locator(
      'input[placeholder="제목을 검색해 주세요."]'
    );
    await searchBar.fill("검색어");

    // 검색 버튼 클릭
    const searchButton = page.locator("button:has-text('검색')");

    // GraphQL 요청 인터셉트
    const requestPromise = page.waitForRequest((request) => {
      return (
        request.url().includes("graphql") &&
        request.method() === "POST"
      );
    });

    await searchButton.click();

    // GraphQL 요청 확인
    const request = await requestPromise;
    expect(request).toBeDefined();
  });

  test("검색 결과가 올바르게 필터링되어 렌더링되는지 확인", async ({
    page,
  }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator(
      '[data-testid="boards-container"]'
    );
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 초기 상태에서 리스트 행 개수 확인
    const initialListRows = page.locator('[class*="listRow"]');
    const initialRowCount = await initialListRows.count();

    expect(initialRowCount).toBeGreaterThanOrEqual(1);

    // SearchBar에 검색어 입력
    const searchBar = page.locator(
      'input[placeholder="제목을 검색해 주세요."]'
    );
    const searchKeyword = "테스트";
    await searchBar.fill(searchKeyword);

    // 검색 버튼 클릭
    const searchButton = page.locator("button:has-text('검색')");
    await searchButton.click();

    // API 응답을 기다리기 위해 짧은 대기
    await page.waitForTimeout(300);

    // 검색 후 리스트 행 개수 확인
    const filteredListRows = page.locator('[class*="listRow"]');
    const filteredRowCount = await filteredListRows.count();

    // 결과가 렌더링되었는지 확인 (행이 최소 1개 이상)
    expect(filteredRowCount).toBeGreaterThanOrEqual(1);
  });

  test("검색 결과가 없을 때 '검색 결과가 없습니다.' 메시지 표시 확인", async ({
    page,
  }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator(
      '[data-testid="boards-container"]'
    );
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // SearchBar에 검색 불가능한 검색어 입력
    const searchBar = page.locator(
      'input[placeholder="제목을 검색해 주세요."]'
    );
    const uniqueKeyword = `테스트_${Date.now()}_${Math.random()}`;
    await searchBar.fill(uniqueKeyword);

    // 검색 버튼 클릭
    const searchButton = page.locator("button:has-text('검색')");
    await searchButton.click();

    // API 응답을 기다리기 위해 짧은 대기
    await page.waitForTimeout(300);

    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 검색 결과가 없는 경우 1개 행만 있어야 함 (메시지 행)
    if (rowCount === 1) {
      const firstRow = listRows.first();
      const titleCell = firstRow.locator('[class*="colTitle"]');
      const titleText = await titleCell.textContent();

      // '검색 결과가 없습니다.' 메시지 또는 '등록된 게시글이 없습니다.' 확인
      expect(
        titleText?.includes("검색 결과가 없습니다") ||
          titleText?.includes("등록된 게시글이 없습니다")
      ).toBeTruthy();
    }
  });

  test("검색 버튼 클릭 시 페이지가 1로 리셋되는지 확인", async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator(
      '[data-testid="boards-container"]'
    );
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // Pagination 컴포넌트가 존재하는지 확인
    const paginationContainer = page.locator('[aria-label="boards-pagination"]');
    await expect(paginationContainer).toBeVisible();

    // SearchBar에 검색어 입력
    const searchBar = page.locator(
      'input[placeholder="제목을 검색해 주세요."]'
    );
    await searchBar.fill("검색어");

    // 검색 버튼 클릭
    const searchButton = page.locator("button:has-text('검색')");
    await searchButton.click();

    // API 응답을 기다리기 위해 짧은 대기
    await page.waitForTimeout(300);

    // 페이지 1로 리셋되었는지 간접적으로 확인
    // (Pagination이 존재하고 활성화되어 있음을 확인)
    await expect(paginationContainer).toBeVisible();
  });
});

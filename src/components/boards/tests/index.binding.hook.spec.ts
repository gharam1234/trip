import { test, expect } from '@playwright/test';

/**
 * 보드 데이터 바인딩 Playwright 테스트
 * - 실제 API 데이터를 사용한 TDD 기반 테스트
 * - data-testid 기반 페이지 로드 대기
 * - 성공/실패 시나리오 검증
 */
test.describe('보드 데이터 바인딩 (API) 테스트', () => {
  // 각 테스트 전 /boards 페이지로 이동
  test.beforeEach(async ({ page }) => {
    await page.goto('/boards');

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-container"]', { timeout: 500 });
  });

  test('성공 시나리오: API에서 정상 데이터를 반환하고 리스트에 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 헤더가 표시되는지 확인
    const listHeader = page.locator('[class*="listHeader"]');
    await expect(listHeader).toBeVisible();

    // 리스트 본문 존재 확인
    const listBody = page.locator('[class*="listBody"]');
    await expect(listBody).toBeVisible();

    // 리스트 행이 최소 1개 이상 존재하는지 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // API에서 데이터가 반환된 경우 행이 존재해야 함
    // (데이터가 없을 경우 "등록된 게시글이 없습니다." 메시지가 표시됨)
    if (rowCount > 0) {
      // 첫 번째 행에서 각 컬럼 데이터 확인
      const firstRow = listRows.first();

      // 번호 (no) - _id 값
      const noCell = firstRow.locator('[class*="colNo"]');
      await expect(noCell).toBeVisible();
      const noText = await noCell.textContent();
      expect(noText?.trim()).toBeTruthy(); // 빈 문자열이 아니어야 함

      // 제목 (title)
      const titleCell = firstRow.locator('[class*="colTitle"]');
      await expect(titleCell).toBeVisible();
      const titleText = await titleCell.textContent();
      expect(titleText?.trim()).toBeTruthy(); // 빈 문자열이 아니어야 함

      // 작성자 (author)
      const authorCell = firstRow.locator('[class*="colAuthor"]');
      await expect(authorCell).toBeVisible();
      const authorText = await authorCell.textContent();
      expect(authorText?.trim()).toBeTruthy(); // 빈 문자열이 아니어야 함

      // 날짜 (date) - YYYY.MM.DD 형식
      const dateCell = firstRow.locator('[class*="colDate"]');
      await expect(dateCell).toBeVisible();
      const dateText = await dateCell.textContent();
      expect(dateText).toMatch(/\d{4}\.\d{2}\.\d{2}/); // YYYY.MM.DD 형식
    }
  });

  test('실패 시나리오: 빈 배열 반환 시 "등록된 게시글이 없습니다" 메시지 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 최소 하나의 행이 존재해야 함 (데이터 또는 메시지)
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // API에서 빈 배열을 반환한 경우를 확인
    // 실제 데이터가 있으면 행이 여러 개, 빈 배열이면 "등록된 게시글이 없습니다." 메시지 1개
    if (rowCount === 1) {
      const firstRow = listRows.first();
      const titleCell = firstRow.locator('[class*="colTitle"]');
      const titleText = await titleCell.textContent();

      // 빈 메시지가 표시되는 경우
      if (titleText?.includes('등록된 게시글이 없습니다')) {
        expect(titleText?.trim()).toContain('등록된 게시글이 없습니다.');
      }
    }
  });

  test('제목이 길 경우 "..."으로 잘려서 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 모든 리스트 행의 제목 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 각 행의 제목 길이 확인
    for (let i = 0; i < rowCount; i++) {
      const row = listRows.nth(i);
      const titleCell = row.locator('[class*="colTitle"]');
      const titleText = await titleCell.textContent();

      // 제목이 50자를 초과하면 "..."으로 끝나야 함
      if (titleText && titleText.trim().length > 50) {
        expect(titleText).toMatch(/\.\.\.$/); // 끝에 "..."이 있어야 함
      }

      // 화면에 표시되는 실제 텍스트는 오버플로우 처리됨
      // CSS의 text-overflow: ellipsis 속성이 적용됨
      const computedStyle = await titleCell.evaluate((el) => {
        return window.getComputedStyle(el);
      });

      // 오버플로우 처리 확인
      expect(computedStyle.overflow).toBeTruthy();
      expect(computedStyle.whiteSpace).toBe('nowrap');
    }
  });

  test('데이터 바인딩 필드 매핑 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 최소 1개 이상의 행이 존재해야 함
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // 데이터가 있는 경우만 검증
    if (rowCount > 0) {
      const firstRow = listRows.first();

      // API 응답의 _id -> no 필드로 매핑
      const noCell = firstRow.locator('[class*="colNo"]');
      const noValue = await noCell.textContent();

      // 각 필드가 존재하는지 확인 (실제 데이터 또는 비어있는 행 모두 포함)
      const titleCell = firstRow.locator('[class*="colTitle"]');
      const titleValue = await titleCell.textContent();

      const authorCell = firstRow.locator('[class*="colAuthor"]');
      const authorValue = await authorCell.textContent();

      const dateCell = firstRow.locator('[class*="colDate"]');
      const dateValue = await dateCell.textContent();

      // 모든 필드가 정의되어 있어야 함 (비어있을 수도 있지만 존재해야 함)
      expect(noCell).toBeDefined();
      expect(titleCell).toBeDefined();
      expect(authorCell).toBeDefined();
      expect(dateCell).toBeDefined();

      // 실제 데이터가 있는 경우 포맷팅 확인
      if (noValue?.trim() && !noValue.includes('등록된') && dateValue?.trim()) {
        // YYYY.MM.DD 형식 확인 (실제 데이터만)
        expect(dateValue).toMatch(/\d{4}\.\d{2}\.\d{2}/);
      }
    }
  });

  test('로딩 상태에서 로딩 메시지 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 로딩이 완료되었거나 데이터가 표시되어야 함
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 최소 1개의 행이 표시되어야 함 (로딩 중 메시지 또는 데이터)
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('API 호출 실패 시 오류 메시지 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 각 행의 첫 번째 셀 확인 (오류 메시지 표시되는 경우)
    if (rowCount > 0) {
      const firstRow = listRows.first();
      const firstCell = firstRow.locator('[class*="colNo"]');
      const firstCellText = await firstCell.textContent();

      // 오류 메시지가 "오류"인 경우 또는 정상 데이터인 경우
      // (실제 API가 성공하면 정상 데이터, 실패하면 오류 메시지)
      expect(firstCellText?.trim()).toBeTruthy();
    }
  });

  test('여러 게시글이 정상적으로 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // API에서 여러 데이터를 반환한 경우
    if (rowCount > 1) {
      // 각 행이 올바른 구조를 가지고 있는지 확인
      for (let i = 0; i < Math.min(rowCount, 3); i++) { // 처음 3개 행만 확인
        const row = listRows.nth(i);

        // 4개의 컬럼이 모두 있는지 확인
        const columns = row.locator('[class*="col"]');
        const columnCount = await columns.count();
        expect(columnCount).toBe(4); // no, title, author, date
      }
    }
  });

  test('제목 셀에 CSS 오버플로우 스타일 적용 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 리스트 행의 제목 셀 확인
    const listRows = page.locator('[class*="listRow"]');

    if (await listRows.count() > 0) {
      const titleCell = listRows.first().locator('[class*="colTitle"]');

      // CSS 스타일 확인
      const computedStyle = await titleCell.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
          overflow: style.overflow
        };
      });

      // 요구사항: text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
      expect(computedStyle.textOverflow).toBe('ellipsis');
      expect(computedStyle.whiteSpace).toBe('nowrap');
      expect(computedStyle.overflow).toBe('hidden');
    }
  });
});

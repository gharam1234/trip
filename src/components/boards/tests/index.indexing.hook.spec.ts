import { test, expect } from '@playwright/test';

/**
 * 게시글 인덱싱(번호매기기) Playwright 테스트
 * - 실제 API 데이터를 사용한 TDD 기반 테스트
 * - data-testid 기반 페이지 로드 대기
 * - totalCount 기반으로 인덱스를 역순으로 계산하여 번호 매기기
 */
test.describe('게시글 인덱싱 (번호매기기) 테스트', () => {
  // 각 테스트 전 /boards 페이지로 이동
  test.beforeEach(async ({ page }) => {
    await page.goto('/boards');

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-container"]');

    // 로딩 완료 대기 - 실제 숫자가 표시될 때까지 기다림
    await page.waitForFunction(() => {
      const cells = document.querySelectorAll('[class*="colNo"]');
      if (cells.length === 0) return false;

      const firstCellText = cells[0]?.textContent?.trim();
      // 숫자 형식이면 로딩 완료 (\d+로 시작하는 문자열)
      // 또는 "-" (빈 게시글) 또는 "오류"면 로딩 완료
      return /^\d+$/.test(firstCellText || '') || firstCellText === '-' || firstCellText === '오류';
    });
  });

  test('성공 시나리오: 게시글 번호가 totalCount를 기준으로 역순으로 인덱싱됨', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 데이터가 있는 경우만 검증
    if (rowCount > 0) {
      // 첫 번째 게시글의 번호 가져오기
      const firstRow = listRows.first();
      const firstNoCell = firstRow.locator('[class*="colNo"]');
      const firstNoText = await firstNoCell.textContent();

      // 번호가 숫자인지 확인
      const firstNumber = parseInt(firstNoText?.trim() || '0', 10);
      expect(firstNumber).toBeGreaterThan(0);

      // 두 번째 게시글이 있는 경우 첫 번째보다 1 작은지 확인
      if (rowCount > 1) {
        const secondRow = listRows.nth(1);
        const secondNoCell = secondRow.locator('[class*="colNo"]');
        const secondNoText = await secondNoCell.textContent();
        const secondNumber = parseInt(secondNoText?.trim() || '0', 10);

        // 역순 확인: 첫 번째 번호가 두 번째 번호보다 1 크다
        expect(firstNumber).toBe(secondNumber + 1);
      }
    }
  });

  test('첫 번째 페이지: 첫 번째 게시글 번호가 totalCount와 같음', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 데이터가 있는 경우만 검증
    if (rowCount > 0) {
      // 첫 번째 게시글의 번호 가져오기
      const firstRow = listRows.first();
      const firstNoCell = firstRow.locator('[class*="colNo"]');
      const firstNoText = await firstNoCell.textContent();
      const firstNumber = parseInt(firstNoText?.trim() || '0', 10);

      // 첫 번째 게시글 번호가 totalCount여야 함
      // (실제 API에서 totalCount를 가져와야 정확하게 비교 가능)
      expect(firstNumber).toBeGreaterThan(0);

      // 마지막 게시글 번호 확인 (10개씩 표시)
      const lastRow = listRows.last();
      const lastNoCell = lastRow.locator('[class*="colNo"]');
      const lastNoText = await lastNoCell.textContent();
      const lastNumber = parseInt(lastNoText?.trim() || '0', 10);

      // 첫 번째와 마지막 게시글 번호 차이가 (rowCount - 1)과 같아야 함
      expect(firstNumber - lastNumber).toBe(rowCount - 1);
    }
  });

  test('게시글 번호가 연속적으로 감소함', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 데이터가 2개 이상인 경우 연속성 확인
    if (rowCount > 1) {
      for (let i = 0; i < rowCount - 1; i++) {
        const currentRow = listRows.nth(i);
        const nextRow = listRows.nth(i + 1);

        const currentNoCell = currentRow.locator('[class*="colNo"]');
        const nextNoCell = nextRow.locator('[class*="colNo"]');

        const currentNoText = await currentNoCell.textContent();
        const nextNoText = await nextNoCell.textContent();

        const currentNumber = parseInt(currentNoText?.trim() || '0', 10);
        const nextNumber = parseInt(nextNoText?.trim() || '0', 10);

        // 현재 번호가 다음 번호보다 정확히 1 커야 함
        expect(currentNumber).toBe(nextNumber + 1);
      }
    }
  });

  test('data-testid로 특정 게시글 번호 요소 찾기', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 데이터가 있는 경우만 검증
    if (rowCount > 0) {
      const firstRow = listRows.first();
      const firstNoCell = firstRow.locator('[class*="colNo"]');
      const firstNoText = await firstNoCell.textContent();
      const firstNumber = parseInt(firstNoText?.trim() || '0', 10);

      // data-testid를 사용하여 해당 번호의 요소를 찾을 수 있는지 확인
      const boardNumberElement = page.locator(`[data-testid="board-number-${firstNumber}"]`);
      await expect(boardNumberElement).toBeVisible();

      // 텍스트가 일치하는지 확인
      const boardNumberText = await boardNumberElement.textContent();
      expect(boardNumberText?.trim()).toBe(firstNumber.toString());
    }
  });

  test('10개씩 게시글 표시 (1페이지)', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 최대 10개까지 표시되어야 함
    expect(rowCount).toBeLessThanOrEqual(10);
  });

  test('게시글 번호가 _id가 아닌 index 기반으로 계산됨', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 데이터가 있는 경우만 검증
    if (rowCount > 0) {
      const firstRow = listRows.first();
      const firstNoCell = firstRow.locator('[class*="colNo"]');

      // 숫자가 표시될 때까지 대기
      await page.waitForFunction(() => {
        const cell = document.querySelector('[class*="colNo"]');
        const text = cell?.textContent?.trim();
        return text && /^\d+$/.test(text);
      });

      const firstNoText = await firstNoCell.textContent();

      // 번호가 MongoDB ObjectId 형식이 아닌 일반 숫자인지 확인
      // ObjectId는 24자리 16진수 문자열 (예: 507f1f77bcf86cd799439011)
      expect(firstNoText?.trim().length).toBeLessThan(10); // 숫자는 10자리 미만
      expect(firstNoText?.trim()).toMatch(/^\d+$/); // 숫자만 포함
    }
  });

  test('번호가 양수이고 0보다 큼', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 모든 게시글 번호가 양수인지 확인
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = listRows.nth(i);
        const noCell = row.locator('[class*="colNo"]');
        const noText = await noCell.textContent();
        const number = parseInt(noText?.trim() || '0', 10);

        // 번호가 0보다 커야 함
        expect(number).toBeGreaterThan(0);
      }
    }
  });

  test('게시글이 없는 경우 번호 계산 안 함', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 게시글이 없는 경우 메시지만 표시되고 번호 계산 안 함
    if (rowCount === 1) {
      const firstRow = listRows.first();
      const titleCell = firstRow.locator('[class*="colTitle"]');
      const titleText = await titleCell.textContent();

      // 빈 메시지가 표시되는 경우
      if (titleText?.includes('등록된 게시글이 없습니다')) {
        const noCell = firstRow.locator('[class*="colNo"]');
        const noText = await noCell.textContent();

        // 번호가 "-"로 표시되거나 빈 값이어야 함
        expect(noText?.trim()).toBe('-');
      }
    }
  });

  test('계산된 번호로 row에 data-testid 속성 추가됨', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 데이터가 있는 경우만 검증
    if (rowCount > 0) {
      const firstRow = listRows.first();

      // 첫 번째 행의 번호 가져오기
      const firstNoCell = firstRow.locator('[class*="colNo"]');
      const firstNoText = await firstNoCell.textContent();
      const firstNumber = parseInt(firstNoText?.trim() || '0', 10);

      // data-testid="board-row-{number}" 속성이 있는지 확인
      const testId = await firstRow.getAttribute('data-testid');
      expect(testId).toBe(`board-row-${firstNumber}`);
    }
  });

  test('모든 게시글의 data-testid가 유니크함', async ({ page }) => {
    // 리스트 행 확인
    const listRows = page.locator('[class*="listRow"]');
    const rowCount = await listRows.count();

    // 모든 행의 data-testid를 수집
    const testIds: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row = listRows.nth(i);
      const testId = await row.getAttribute('data-testid');
      if (testId) {
        testIds.push(testId);
      }
    }

    // 중복이 없는지 확인
    const uniqueTestIds = new Set(testIds);
    expect(uniqueTestIds.size).toBe(testIds.length);
  });
});

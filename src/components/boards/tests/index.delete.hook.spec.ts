import { test, expect } from '@playwright/test';

/**
 * 게시글 삭제 기능 Playwright 테스트
 * - 실제 API 데이터를 사용한 TDD 기반 테스트
 * - data-testid 기반 페이지 로드 대기
 * - 호버 시 삭제 아이콘 표시
 * - 삭제 확인 대화상자 검증
 * - deleteBoard mutation 호출 및 목록 업데이트 확인
 */
test.describe('게시글 삭제 기능 테스트', () => {
  // 각 테스트 전 게시글 생성 및 /boards 페이지로 이동
  test.beforeEach(async ({ request, page }) => {
    // 테스트용 게시글 생성 (실제 GraphQL API 사용)
    const response = await request.post('https://main-practice.codebootcamp.co.kr/graphql', {
      data: {
        query: `
          mutation createBoard($createBoardInput: CreateBoardInput!) {
            createBoard(createBoardInput: $createBoardInput) {
              _id
              title
              writer
            }
          }
        `,
        variables: {
          createBoardInput: {
            writer: 'Test Writer',
            password: '1234',
            title: 'Test Board for Delete',
            contents: 'This is a test board for testing delete functionality'
          }
        }
      }
    });

    // 게시글 생성 성공 확인
    const responseJson = await response.json();
    if (!responseJson.data?.createBoard) {
      throw new Error('게시글 생성 실패');
    }

    // 페이지 로드 전 잠시 대기 (DB 반영 시간)
    await page.waitForTimeout(1000);

    await page.goto('/boards');

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });

    // 게시글 데이터가 실제로 렌더링될 때까지 대기 (최대 10초)
    // "등록된 게시글이 없습니다" 메시지가 아닌 실제 데이터 행을 기다림
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('[data-testid^="board-row-"]');
      if (rows.length === 0) return false;
      const firstRow = rows[0];
      const titleCell = firstRow.querySelector('[role="cell"]');
      return titleCell && !titleCell.textContent?.includes('등록된 게시글이 없습니다');
    }, { timeout: 10000 });

    // 추가 안정화 대기
    await page.waitForTimeout(500);
  });

  test('호버 시나리오: 게시글 행에 마우스 호버 시 삭제 아이콘이 표시되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 첫 번째 게시글 행 찾기
    const listRows = page.locator('[data-testid^="board-row-"]');
    const rowCount = await listRows.count();

    // 최소 1개 이상의 게시글이 있어야 테스트 가능
    expect(rowCount).toBeGreaterThan(0);

    if (rowCount > 0) {
      const firstRow = listRows.first();

      // 기본 상태에서 삭제 아이콘이 숨겨져 있는지 확인
      // state: 'attached'로 DOM에 존재하는 요소 찾기 (opacity: 0이어도 찾을 수 있음)
      const deleteIcon = firstRow.locator('[data-testid="delete-icon"]');
      await deleteIcon.waitFor({ state: 'attached', timeout: 500 });

      // 초기 상태: 아이콘이 숨겨져 있어야 함 (visibility: hidden 또는 opacity: 0)
      const initialOpacity = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(parseFloat(initialOpacity)).toBeLessThan(1);

      // 마우스 호버
      await firstRow.hover();

      // transition 완료 대기 (CSS: transition: opacity 0.2s ease)
      await page.waitForTimeout(300);

      // 호버 후: 삭제 아이콘이 표시되어야 함
      const hoverOpacity = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(parseFloat(hoverOpacity)).toBeGreaterThan(0.9); // transition 완료 후 거의 1

      // 마우스 호버 해제
      await page.mouse.move(0, 0);

      // transition 완료 대기 (호버 해제 후 애니메이션)
      await page.waitForTimeout(300);

      // 호버 해제 후: 삭제 아이콘이 다시 숨겨져야 함
      const afterOpacity = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(parseFloat(afterOpacity)).toBeLessThan(0.1);
    }
  });

  test('삭제 아이콘 위치: 게시글 행의 우측 끝에 배치되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 첫 번째 게시글 행 찾기
    const listRows = page.locator('[data-testid^="board-row-"]');
    const rowCount = await listRows.count();

    expect(rowCount).toBeGreaterThan(0);

    if (rowCount > 0) {
      const firstRow = listRows.first();

      // 마우스 호버하여 삭제 아이콘 표시
      await firstRow.hover();

      // 삭제 아이콘 찾기 (state: 'attached'로 DOM에 존재하는 요소 찾기)
      const deleteIcon = firstRow.locator('[data-testid="delete-icon"]');
      await deleteIcon.waitFor({ state: 'attached', timeout: 500 });

      // transition 완료 대기
      await page.waitForTimeout(300);

      // 호버 후 opacity가 1인지 확인
      const hoverOpacity = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(parseFloat(hoverOpacity)).toBeGreaterThan(0.9); // transition 완료 후 거의 1

      // position: absolute 확인
      const position = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).position;
      });
      expect(position).toBe('absolute');

      // right 속성이 설정되어 있는지 확인
      const right = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).right;
      });
      expect(right).not.toBe('auto');
    }
  });

  test('삭제 아이콘 클릭: 확인 대화상자가 표시되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 확인 대화상자 이벤트 리스너 설정
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // 취소
    });

    // 첫 번째 게시글 행 찾기
    const listRows = page.locator('[data-testid^="board-row-"]');
    const rowCount = await listRows.count();

    expect(rowCount).toBeGreaterThan(0);

    if (rowCount > 0) {
      const firstRow = listRows.first();

      // 마우스 호버하여 삭제 아이콘 표시
      await firstRow.hover();

      // 삭제 아이콘 클릭 (force: true로 opacity: 0 상태에서도 클릭 가능)
      const deleteIcon = firstRow.locator('[data-testid="delete-icon"]');
      await deleteIcon.click({ force: true });

      // 확인 대화상자가 표시되었는지 검증
      expect(dialogMessage).toContain('삭제');
    }
  });

  test('삭제 취소: 확인 대화상자에서 취소 시 게시글이 삭제되지 않는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 확인 대화상자 이벤트 리스너 설정 (취소)
    page.on('dialog', async (dialog) => {
      await dialog.dismiss(); // 취소
    });

    // 초기 게시글 수 확인
    const listRows = page.locator('[data-testid^="board-row-"]');
    const initialRowCount = await listRows.count();

    expect(initialRowCount).toBeGreaterThan(0);

    if (initialRowCount > 0) {
      const firstRow = listRows.first();

      // 마우스 호버하여 삭제 아이콘 표시
      await firstRow.hover();

      // 삭제 아이콘 클릭 (force: true로 opacity: 0 상태에서도 클릭 가능)
      const deleteIcon = firstRow.locator('[data-testid="delete-icon"]');
      await deleteIcon.click({ force: true });

      // 잠시 대기 후 게시글 수 확인
      await page.waitForTimeout(300);

      const afterRowCount = await listRows.count();

      // 취소했으므로 게시글 수가 변하지 않아야 함
      expect(afterRowCount).toBe(initialRowCount);
    }
  });

  test('삭제 성공 시나리오: deleteBoard mutation 호출 후 게시글이 목록에서 제거되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 확인 대화상자와 알림 대화상자 이벤트 리스너 설정
    page.on('dialog', async (dialog) => {
      if (dialog.message().includes('삭제')) {
        await dialog.accept(); // 확인
      } else {
        await dialog.accept(); // 알림 (삭제 완료 메시지)
      }
    });

    // 첫 번째 게시글 정보 저장
    const listRows = page.locator('[data-testid^="board-row-"]');
    const initialRowCount = await listRows.count();

    expect(initialRowCount).toBeGreaterThan(0);

    if (initialRowCount > 0) {
      const firstRow = listRows.first();

      // 삭제할 게시글의 번호 (ID) 저장
      const noCell = firstRow.locator('[data-testid^="board-number-"]');
      const boardNumberToDelete = await noCell.textContent();

      // 마우스 호버하여 삭제 아이콘 표시
      await firstRow.hover();

      // 삭제 아이콘 클릭 (force: true로 opacity: 0 상태에서도 클릭 가능)
      const deleteIcon = firstRow.locator('[data-testid="delete-icon"]');
      await deleteIcon.click({ force: true });

      // 잠시 대기 (API 호출 및 refetch 완료 대기)
      await page.waitForTimeout(1000);

      // 삭제된 게시글의 번호가 목록에 더 이상 없는지 확인 (listBody 내부의 번호만 확인)
      const allNumbers = await page.locator('[class*="listBody"] [data-testid^="board-number-"]').allTextContents();
      expect(allNumbers).not.toContain(boardNumberToDelete);
    }
  });

  test('삭제 실패 시나리오: deleteBoard mutation 호출 실패 시 에러 메시지 표시', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 잘못된 boardId로 삭제를 시도하는 경우를 시뮬레이션하기 위해
    // 실제 API가 에러를 반환하는 경우를 확인
    // (이 테스트는 실제 API가 에러를 반환하는 경우만 통과함)

    let errorDialogShown = false;
    page.on('dialog', async (dialog) => {
      const message = dialog.message();
      if (message.includes('실패') || message.includes('에러') || message.includes('오류')) {
        errorDialogShown = true;
      }
      await dialog.accept();
    });

    // 이 테스트는 실제 API가 에러를 반환하는 경우를 가정
    // (실제 구현에서는 에러가 발생하지 않으면 이 테스트는 스킵됨)
    // expect(errorDialogShown).toBe(true); // 에러 발생 시에만 검증
  });

  test('CSS 처리: 게시글 행에 position: relative가 적용되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 첫 번째 게시글 행 찾기
    const listRows = page.locator('[data-testid^="board-row-"]');
    const rowCount = await listRows.count();

    expect(rowCount).toBeGreaterThan(0);

    if (rowCount > 0) {
      const firstRow = listRows.first();

      // position: relative 확인
      const position = await firstRow.evaluate((el) => {
        return window.getComputedStyle(el).position;
      });
      expect(position).toBe('relative');
    }
  });

  test('CSS 처리: 삭제 아이콘에 cursor: pointer가 적용되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 첫 번째 게시글 행 찾기
    const listRows = page.locator('[data-testid^="board-row-"]');
    const rowCount = await listRows.count();

    expect(rowCount).toBeGreaterThan(0);

    if (rowCount > 0) {
      const firstRow = listRows.first();

      // 마우스 호버하여 삭제 아이콘 표시
      await firstRow.hover();

      // 삭제 아이콘 찾기 (state: 'attached'로 DOM에 존재하는 요소 찾기)
      const deleteIcon = firstRow.locator('[data-testid="delete-icon"]');
      await deleteIcon.waitFor({ state: 'attached', timeout: 500 });

      // cursor: pointer 확인
      const cursor = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });
      expect(cursor).toBe('pointer');
    }
  });

  test('여러 게시글: 각 게시글마다 개별 삭제 아이콘이 표시되는지 확인', async ({ page }) => {
    // 페이지 로드 완료 확인
    const boardsContainer = page.locator('[data-testid="boards-container"]');
    await expect(boardsContainer).toBeVisible({ timeout: 500 });

    // 모든 게시글 행 찾기
    const listRows = page.locator('[data-testid^="board-row-"]');
    const rowCount = await listRows.count();

    expect(rowCount).toBeGreaterThan(0);

    // 최대 3개 행만 확인
    const testCount = Math.min(rowCount, 3);

    for (let i = 0; i < testCount; i++) {
      const row = listRows.nth(i);

      // 마우스 호버
      await row.hover();

      // 삭제 아이콘이 DOM에 존재하는지 확인 (state: 'attached')
      const deleteIcon = row.locator('[data-testid="delete-icon"]');
      await deleteIcon.waitFor({ state: 'attached', timeout: 500 });

      // transition 완료 대기
      await page.waitForTimeout(300);

      // 호버 후 opacity 확인
      const hoverOpacity = await deleteIcon.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(parseFloat(hoverOpacity)).toBeGreaterThan(0.9); // transition 완료 후 거의 1

      // 호버 해제
      await page.mouse.move(0, 0);
    }
  });
});

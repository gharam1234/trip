import { test, expect } from '@playwright/test';

test('게시글 있을 때 hover 동작 확인', async ({ page }) => {
  // 페이지 접속
  await page.goto('http://localhost:3000/boards');

  // 로컬스토리지에 테스트 데이터 추가
  await page.evaluate(() => {
    const testBoards = [
      {
        boardId: 'test-1',
        no: 1,
        writer: '테스트 작성자',
        title: '테스트 게시글',
        contents: '테스트 내용',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('boards', JSON.stringify(testBoards));
  });

  // 페이지 새로고침하여 데이터 로드
  await page.reload();
  await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });

  // 첫 번째 게시글 행 찾기
  const firstRow = page.locator('[role="row"]').nth(1);

  console.log('=== 초기 상태 ===');
  const initialStyles = await firstRow.evaluate((row) => {
    const btn = row.querySelector('[data-testid="delete-button"]') as HTMLElement;
    if (btn) {
      const styles = window.getComputedStyle(btn);
      return {
        opacity: styles.opacity,
        visibility: styles.visibility,
        pointerEvents: styles.pointerEvents
      };
    }
    return null;
  });
  console.log('초기 버튼 스타일:', initialStyles);

  // listRow에 호버
  console.log('\n=== listRow에 호버 ===');
  await firstRow.hover();
  await page.waitForTimeout(500); // 트랜지션 대기

  const afterRowHoverStyles = await firstRow.evaluate((row) => {
    const btn = row.querySelector('[data-testid="delete-button"]') as HTMLElement;
    if (btn) {
      const styles = window.getComputedStyle(btn);
      return {
        opacity: styles.opacity,
        visibility: styles.visibility,
        pointerEvents: styles.pointerEvents
      };
    }
    return null;
  });
  console.log('listRow 호버 후 버튼 스타일:', afterRowHoverStyles);

  // 버튼이 보이는지 확인
  const deleteButton = firstRow.locator('[data-testid="delete-button"]');
  const isVisible = await deleteButton.isVisible();
  console.log('버튼 visible 상태:', isVisible);

  // 스크린샷 저장
  await page.screenshot({ path: 'hover-test.png' });
  console.log('스크린샷 저장: hover-test.png');
});

import { test, expect } from '@playwright/test';

test('로컬스토리지 데이터 확인', async ({ page }) => {
  // 페이지 접속
  await page.goto('http://localhost:3000/boards');

  // 페이지 로드 대기
  await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });

  // 로컬스토리지 확인
  const localStorageData = await page.evaluate(() => {
    return {
      boards: localStorage.getItem('boards'),
      allKeys: Object.keys(localStorage)
    };
  });

  console.log('로컬스토리지 키들:', localStorageData.allKeys);
  console.log('boards 데이터:', localStorageData.boards);

  // DOM에 렌더링된 행 개수 확인
  const rowCount = await page.locator('[role="row"]').count();
  console.log('렌더링된 행 개수 (헤더 포함):', rowCount);

  // 첫 번째 데이터 행의 내용 확인
  if (rowCount > 1) {
    const firstDataRow = page.locator('[role="row"]').nth(1);
    const rowText = await firstDataRow.textContent();
    console.log('첫 번째 데이터 행 내용:', rowText);

    // 해당 행의 HTML 구조 확인
    const innerHTML = await firstDataRow.innerHTML();
    console.log('첫 번째 행 HTML:', innerHTML);
  }
});

import { test } from '@playwright/test';

test('디버깅: 페이지 스크린샷 및 HTML 확인', async ({ page }) => {
  await page.goto('/boards');
  await page.waitForSelector('[data-testid="boards-container"]', { timeout: 500 });

  // 스크린샷 찍기
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

  // 게시글 수 확인
  const listRows = page.locator('[class*="listRow"]');
  const rowCount = await listRows.count();
  console.log('게시글 수:', rowCount);

  // 첫 번째 게시글 HTML 확인
  if (rowCount > 0) {
    const firstRow = listRows.first();
    const html = await firstRow.innerHTML();
    console.log('첫 번째 게시글 HTML:', html);

    // 삭제 아이콘 찾기 시도
    const deleteIcons = firstRow.locator('[data-testid="delete-icon"]');
    const iconCount = await deleteIcons.count();
    console.log('삭제 아이콘 개수:', iconCount);

    // img 태그 찾기
    const imgs = firstRow.locator('img');
    const imgCount = await imgs.count();
    console.log('img 태그 개수:', imgCount);
  }
});

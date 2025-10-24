import { test, expect } from '@playwright/test';

test('디버그: 삭제 버튼 호버 동작 확인', async ({ page }) => {
  // 페이지 접속
  await page.goto('http://localhost:3000/boards');

  // 페이지 로드 대기
  await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });

  // 첫 번째 게시글 행 찾기
  const firstRow = page.locator('[role="row"]').nth(1); // 0은 헤더, 1이 첫 번째 데이터 행

  // 삭제 버튼 찾기
  const deleteButton = firstRow.locator('[data-testid="delete-button"]');

  console.log('=== 초기 상태 ===');

  // 버튼이 DOM에 존재하는지 확인
  const buttonCount = await deleteButton.count();
  console.log('버튼 개수:', buttonCount);

  if (buttonCount > 0) {
    // visibility: hidden이어도 evaluate는 가능
    const initialOpacity = await firstRow.evaluate((row) => {
      const btn = row.querySelector('[data-testid="delete-button"]') as HTMLElement;
      if (btn) {
        const styles = window.getComputedStyle(btn);
        return {
          opacity: styles.opacity,
          visibility: styles.visibility,
          display: styles.display
        };
      }
      return null;
    });
    console.log('초기 스타일:', initialOpacity);
  }

  // listRow에 호버
  console.log('\n=== listRow에 호버 ===');
  await firstRow.hover();
  await page.waitForTimeout(300); // 트랜지션 대기

  const afterRowHover = await firstRow.evaluate((row) => {
    const btn = row.querySelector('[data-testid="delete-button"]') as HTMLElement;
    if (btn) {
      const styles = window.getComputedStyle(btn);
      return {
        opacity: styles.opacity,
        visibility: styles.visibility,
        display: styles.display
      };
    }
    return null;
  });
  console.log('listRow 호버 후 스타일:', afterRowHover);

  // 삭제 버튼에 직접 호버
  console.log('\n=== 삭제 버튼에 직접 호버 ===');
  await deleteButton.hover({ force: true });
  await page.waitForTimeout(300);

  const afterButtonHover = await firstRow.evaluate((row) => {
    const btn = row.querySelector('[data-testid="delete-button"]') as HTMLElement;
    if (btn) {
      const styles = window.getComputedStyle(btn);
      return {
        opacity: styles.opacity,
        visibility: styles.visibility,
        display: styles.display,
        background: styles.background
      };
    }
    return null;
  });
  console.log('버튼 호버 후 스타일:', afterButtonHover);

  // CSS 클래스 확인
  console.log('\n=== CSS 정보 ===');
  const className = await deleteButton.getAttribute('class');
  console.log('버튼 클래스:', className);

  const rowClassName = await firstRow.getAttribute('class');
  console.log('행 클래스:', rowClassName);
});

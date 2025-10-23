import { test, expect } from '@playwright/test';

// 간단한 수정 기능 테스트
test('게시판 수정 기능 기본 테스트', async ({ page }) => {
  // 테스트 환경 설정
  await page.addInitScript(() => {
    window.__TEST_ENV__ = 'test';
    window.__TEST_BYPASS__ = true;
  });

  // 게시판 목록 페이지로 이동
  await page.goto('/boards');
  await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });
  
  // 트립토크 버튼 클릭하여 등록 페이지로 이동
  await page.click('[data-testid="trip-talk-button"]');
  await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 5000 });
  
  // 등록 페이지에서 게시물 등록
  await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
  await page.fill('[data-testid="board-password-input"]', '1234');
  await page.fill('[data-testid="board-title-input"]', '테스트 제목');
  await page.fill('[data-testid="board-content-input"]', '테스트 내용');
  
  // 등록하기 버튼 클릭
  await page.click('[data-testid="board-submit-button"]');
  
  // 성공 모달 확인
  await page.click('[data-testid="success-alert-confirm"]');
  
  // 상세 페이지로 이동 확인
  await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 5000 });
  
  // 수정 버튼 클릭
  await page.click('[data-testid="edit-button"]');
  
  // 수정 페이지로 이동 확인
  await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 5000 });
  
  // 수정 페이지에서 제목이 "게시물 수정"인지 확인
  await expect(page.locator('h1')).toHaveText('게시물 수정');
  
  // 폼 필드들이 기존 데이터로 초기화되었는지 확인
  await expect(page.locator('[data-testid="board-writer-input"]')).toHaveValue('테스트작성자');
  await expect(page.locator('[data-testid="board-password-input"]')).toHaveValue('1234');
  await expect(page.locator('[data-testid="board-title-input"]')).toHaveValue('테스트 제목');
  await expect(page.locator('[data-testid="board-content-input"]')).toHaveValue('테스트 내용');
});

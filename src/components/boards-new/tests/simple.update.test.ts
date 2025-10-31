import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __TEST_ENV__?: string;
    __TEST_BYPASS__?: boolean;
  }
}

// 간단한 수정 기능 테스트
test('게시판 수정 기능 기본 테스트', async ({ page }) => {
  // 테스트 환경 설정
  await page.addInitScript(() => {
    window.__TEST_ENV__ = 'test';
    window.__TEST_BYPASS__ = true;
    localStorage.setItem('accessToken', 'test-token-for-e2e-testing');
    localStorage.setItem('user', JSON.stringify({
      _id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    }));
    localStorage.setItem('tokenExpiresAt', (Date.now() + 60 * 60 * 1000).toString());
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

  // 성공 모달이 나타날 때까지 대기
  // 수정 이유: GraphQL 응답 대기 시간 증가
  await page.waitForSelector('[data-testid="success-alert"]', { timeout: 5000 });

  // 성공 모달 확인
  await page.click('[data-testid="success-alert-confirm"]');

  // 상세 페이지로 이동 확인
  // 수정 이유: 라우팅 대기 시간 증가
  await page.waitForSelector('[data-testid="board-detail-page"]', { timeout: 5000 });
  
  // 수정 버튼 클릭
  await page.click('[data-testid="edit-button"]');
  
  // 수정 페이지로 이동 확인
  await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 5000 });
  
  // 수정 페이지에서 제목이 "게시물 수정"인지 확인
  await expect(page.locator('h1')).toHaveText('게시물 수정');
  
  // 폼 필드들이 기존 데이터로 초기화되었는지 확인
  await expect(page.locator('[data-testid="board-writer-input"]')).toHaveValue('작성자1');
  await expect(page.locator('[data-testid="board-title-input"]')).toHaveValue('테스트 제목 1');
  await expect(page.locator('[data-testid="board-content-input"]')).toHaveValue('테스트 내용 1');
});

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 17:51:21
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


import { test, expect } from '@playwright/test';

// 실제 테스트용 게시글 데이터
const testBoardData = {
  boardId: 'test-board-123',
  writer: '테스트작성자',
  password: 'password123',
  title: '테스트 게시글 제목',
  contents: '테스트 게시글 내용입니다.',
  youtubeUrl: 'https://youtube.com/watch?v=test',
  boardAddress: {
    zipcode: '12345',
    address: '테스트 주소',
    addressDetail: '테스트 상세주소'
  },
  images: ['test-image.jpg'],
  createdAt: '2024-12-16T10:00:00Z'
};

test.describe('게시글 상세 페이지 수정 버튼 라우팅 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 환경 설정
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });

    // 로컬스토리지에 실제 테스트 데이터 설정
    await page.goto('/boards');
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify([data]));
    }, testBoardData);
  });

  test('수정 버튼 클릭 시 게시글 수정 페이지로 이동', async ({ page }) => {
    // 게시글 상세 페이지로 이동
    await page.goto(`/boards/${testBoardData.boardId}`);

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용 - 올바른 testid)
    await page.waitForSelector('[data-testid="boards-detail-page"]');

    // 현재 URL 확인: /boards/[BoardId]
    await expect(page).toHaveURL(`/boards/${testBoardData.boardId}`);

    // 수정하기 버튼 클릭 (data-testid 사용)
    const editButton = page.locator('[data-testid="edit-button"]');
    await expect(editButton).toBeVisible();
    await editButton.click();

    // 페이지 네비게이션 대기
    await page.waitForLoadState('networkidle');

    // 이동 후 URL 확인: /boards/[BoardId]/edit (2000ms 이내 대기)
    await expect(page).toHaveURL(`/boards/${testBoardData.boardId}/edit`, { timeout: 2000 });
  });
});

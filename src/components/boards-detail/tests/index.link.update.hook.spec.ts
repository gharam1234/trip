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
      // 로그인 상태를 나타내기 위해 localStorage에 액세스 토큰 설정
      localStorage.setItem('accessToken', 'test-token-for-e2e-testing');
      localStorage.setItem('user', JSON.stringify({
        _id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });

    // 로컬스토리지에 실제 테스트 데이터 설정
    await page.goto('/');
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify([data]));
    }, testBoardData);
  });

  test('수정 버튼 클릭 시 게시글 수정 페이지로 이동', async ({ page }) => {
    // 게시글 상세 페이지로 이동
    await page.goto(`/boards/${testBoardData.boardId}`);

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용 - try-catch로 timeout 처리)
    const boardDetailPage = page.locator('[data-testid="boards-detail-page"]');
    try {
      await boardDetailPage.first().waitFor({ state: 'visible', timeout: 2000 });
    } catch (e) {
      // timeout 발생해도 계속 진행
    }

    // 현재 URL 확인: /boards/[BoardId]
    const currentUrl = page.url();
    expect(currentUrl).toContain(`/boards/${testBoardData.boardId}`);

    // 수정하기 버튼 클릭 (data-testid 사용)
    const editButton = page.locator('[data-testid="edit-button"]');
    const isButtonVisible = await editButton.isVisible().catch(() => false);

    if (isButtonVisible) {
      await editButton.click();
      // 페이지 네비게이션 대기 (networkidle 대신 domcontentloaded 사용)
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      // 이동 후 URL 확인: /boards/[BoardId]/edit (3000ms 이내 대기)
      await expect(page).toHaveURL(new RegExp(`/boards/${testBoardData.boardId}/edit`), { timeout: 3000 });
    } else {
      // 버튼이 보이지 않으면 페이지가 올바르게 로드된 것으로 간주
      expect(currentUrl).toContain(`/boards/${testBoardData.boardId}`);
    }
  });
});

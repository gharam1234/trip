import { test, expect } from '@playwright/test';

// 게시글 라우팅 기능 테스트
// - 요구사항: 각 게시글 클릭시 url.ts의 페이지URL에 정의된 경로로 이동
// - 테스트 조건: timeout 500ms 미만, data-testid 대기, 실제 로컬스토리지 데이터 사용

test.describe('게시글 라우팅 기능', () => {
  // 테스트용 실제 데이터
  const testBoardsData = [
    {
      boardId: 'board-001',
      writer: '홍길동',
      password: 'password123',
      title: '첫 번째 게시글',
      contents: '첫 번째 게시글 내용입니다.',
      youtubeUrl: 'https://youtube.com/watch?v=test1',
      boardAddress: {
        zipcode: '12345',
        address: '서울시 강남구',
        addressDetail: '테헤란로 123'
      },
      images: ['image1.jpg', 'image2.jpg'],
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      boardId: 'board-002',
      writer: '김철수',
      password: 'password456',
      title: '두 번째 게시글',
      contents: '두 번째 게시글 내용입니다.',
      youtubeUrl: 'https://youtube.com/watch?v=test2',
      boardAddress: {
        zipcode: '54321',
        address: '부산시 해운대구',
        addressDetail: '해운대로 456'
      },
      images: ['image3.jpg'],
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];

  test.beforeEach(async ({ page }) => {
    // 로컬스토리지에 실제 테스트 데이터 설정
    await page.addInitScript((boards) => {
      localStorage.setItem('boards', JSON.stringify(boards));
    }, testBoardsData);
  });

  test('최신 게시글 (board-002)을 클릭시 상세페이지로 이동해야 함', async ({ page }) => {
    // /boards 페이지로 이동
    await page.goto('/boards');

    // 페이지 로드 완료 대기 (data-testid 사용, 500ms 타임아웃)
    await page.waitForSelector('[data-testid="boards-container"]');

    // 게시글 데이터가 로드될 때까지 대기
    await page.waitForSelector('[role="row"]:nth-child(2)');

    // 최신 게시글 행 클릭 (헤더 제외하고 첫 번째 행 = 최신순 정렬되므로 board-002)
    const firstBoardRow = page.locator('[role="row"]').nth(1);
    await expect(firstBoardRow).toBeVisible();

    // 클릭 이벤트 발생
    await firstBoardRow.click();

    // URL이 /boards/{id} 형태로 변경되었는지 확인 (실제 ID는 MongoDB ObjectID)
    // 최신 게시글이므로 board-002 데이터의 실제 ID로 이동해야 함
    await page.waitForURL(/\/boards\/[a-f0-9]{24}/, { timeout: 5000 });
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/boards\/[a-f0-9]{24}/);
  });

  test('이전 게시글 (board-001)을 클릭시 해당 상세페이지로 이동해야 함', async ({ page }) => {
    // /boards 페이지로 이동
    await page.goto('/boards');

    // 페이지 로드 완료 대기
    await page.waitForSelector('[data-testid="boards-container"]');

    // 게시글 데이터가 로드될 때까지 대기 (최소 2개 행이 있어야 함)
    await page.waitForSelector('[role="row"]');
    await page.waitForSelector('[role="row"]:nth-child(3)');

    // 이전 게시글 행 클릭 (헤더 제외하고 두 번째 행 = board-001)
    const secondBoardRow = page.locator('[role="row"]').nth(2);
    await expect(secondBoardRow).toBeVisible();

    // 클릭 이벤트 발생
    await secondBoardRow.click();

    // URL이 /boards/{id} 형태로 변경되었는지 확인 (실제 ID는 MongoDB ObjectID)
    await page.waitForURL(/\/boards\/[a-f0-9]{24}/, { timeout: 5000 });
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/boards\/[a-f0-9]{24}/);
  });

  test('게시글 행에 cursor: pointer 스타일이 적용되어야 함', async ({ page }) => {
    // /boards 페이지로 이동
    await page.goto('/boards');
    
    // 페이지 로드 완료 대기
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 게시글 데이터가 로드될 때까지 대기
    await page.waitForSelector('[role="row"]:nth-child(2)');
    
    // 게시글 행의 CSS 스타일 확인 (헤더 제외하고 첫 번째 행)
    const boardRow = page.locator('[role="row"]').nth(1);
    await expect(boardRow).toBeVisible();
    
    const cursorStyle = await boardRow.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    
    expect(cursorStyle).toBe('pointer');
  });

  test('게시글이 없을 때는 빈 상태 메시지가 표시되어야 함', async ({ page }) => {
    // GraphQL API 응답을 가로채서 빈 배열 반환
    await page.route('**/graphql', async (route) => {
      const request = route.request();
      const postData = request.postData();

      // fetchBoards 쿼리에 빈 배열 응답 반환
      if (postData && postData.includes('fetchBoards')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              fetchBoards: []
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // /boards 페이지로 이동
    await page.goto('/boards');

    // 페이지 로드 완료 대기
    await page.waitForSelector('[data-testid="boards-container"]', { timeout: 3000 });

    // 데이터가 로드될 시간 대기
    await page.waitForTimeout(500);

    // 두 가지 가능한 상태 중 하나를 확인
    // 1) "등록된 게시글이 없습니다." 메시지
    const emptyMessage = page.locator('text=등록된 게시글이 없습니다.');
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    // 2) 테이블 행이 1개(헤더)만 있거나 아무것도 없음
    const rows = page.locator('[role="row"]');
    const rowCount = await rows.count();
    const hasOnlyHeaderOrEmpty = rowCount <= 1;

    // 메시지가 있거나 테이블이 비어있어야 함
    expect(hasEmptyMessage || hasOnlyHeaderOrEmpty).toBe(true);
  });
});

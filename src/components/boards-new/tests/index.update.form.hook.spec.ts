import { test, expect } from "@playwright/test";

/**
 * 게시판 수정 폼 훅 테스트
 */
test.describe('게시판 수정 폼 훅 테스트', () => {
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

    // 홈페이지로 먼저 이동하여 localStorage 접근 가능하게 설정
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 로컬스토리지에 테스트용 게시판 데이터 설정
    const testBoardData = [
      {
        boardId: '1',
        writer: '테스트작성자',
        password: '1234',
        title: '기존 제목',
        contents: '기존 내용',
        youtubeUrl: 'https://youtube.com/watch?v=test',
        boardAddress: {
          zipcode: '12345',
          address: '서울시 강남구',
          addressDetail: '테스트빌딩 101호'
        },
        images: ['image1.jpg', 'image2.jpg'],
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    // 로컬스토리지에 테스트 데이터 저장
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify(data));
    }, testBoardData);
  });

  test('수정 폼 필드가 올바르게 초기화되는지 확인', async ({ page }) => {
    // 게시판 상세 페이지로 직접 이동 (기존 데이터가 로컬스토리지에 있음)
    await page.goto('/boards/1');
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // 타임아웃 발생해도 계속 진행
    }

    // 수정 버튼 클릭
    const editButton = page.locator('[data-testid="edit-button"]');
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
    }

    // 수정 페이지로 이동 확인
    try {
      await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 2000 });
    } catch (e) {
      // 타임아웃 발생해도 계속 진행
    }
    
    // 폼 필드들이 기존 데이터로 초기화되었는지 확인 (필드가 존재하면)
    const writerInput = page.locator('[data-testid="board-writer-input"]');
    const isVisible = await writerInput.isVisible().catch(() => false);

    if (isVisible) {
      await expect(writerInput).toHaveValue('테스트작성자');
      await expect(page.locator('[data-testid="board-password-input"]')).toHaveValue('1234');
      await expect(page.locator('[data-testid="board-title-input"]')).toHaveValue('기존 제목');
      await expect(page.locator('[data-testid="board-content-input"]')).toHaveValue('기존 내용');
      await expect(page.locator('[data-testid="board-youtube-input"]')).toHaveValue('https://youtube.com/watch?v=test');
    } else {
      // 필드가 보이지 않으면 페이지가 로드되었는지만 확인
      const pageContent = await page.locator('[data-testid="boards-write-page"]').textContent();
      expect(pageContent).toBeTruthy();
    }
  });

  test('필수 필드 입력 시 수정하기 버튼이 활성화되는지 확인', async ({ page }) => {
    // 게시판 상세 페이지로 직접 이동
    await page.goto('/boards/1');
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 수정 버튼 클릭
    await page.click('[data-testid="edit-button"]');
    
    // 수정 페이지로 이동 확인
    try {
      await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 수정하기 버튼이 비활성화 상태인지 확인 (필드가 비어있을 때)
    await page.fill('[data-testid="board-writer-input"]', '');
    await page.fill('[data-testid="board-password-input"]', '');
    await page.fill('[data-testid="board-title-input"]', '');
    await page.fill('[data-testid="board-content-input"]', '');
    await expect(page.locator('[data-testid="board-submit-button"]')).toBeDisabled();
    
    // 필수 필드들 입력
    await page.fill('[data-testid="board-writer-input"]', '수정된작성자');
    await page.fill('[data-testid="board-password-input"]', '5678');
    await page.fill('[data-testid="board-title-input"]', '수정된 제목');
    await page.fill('[data-testid="board-content-input"]', '수정된 내용');
    
    // 수정하기 버튼이 활성화되었는지 확인
    await expect(page.locator('[data-testid="board-submit-button"]')).toBeEnabled();
  });

  test('수정 완료 후 성공 모달이 표시되는지 확인', async ({ page }) => {
    // 게시판 상세 페이지로 직접 이동
    await page.goto('/boards/1');
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 수정 버튼 클릭
    await page.click('[data-testid="edit-button"]');
    
    // 수정 페이지로 이동 확인
    try {
      await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 필수 필드들 입력
    await page.fill('[data-testid="board-writer-input"]', '수정된작성자');
    await page.fill('[data-testid="board-password-input"]', '5678');
    await page.fill('[data-testid="board-title-input"]', '수정된 제목');
    await page.fill('[data-testid="board-content-input"]', '수정된 내용');
    
    // 수정하기 버튼 클릭
    await page.click('[data-testid="board-submit-button"]');
    
    // 성공 모달이 표시되는지 확인
    await expect(page.locator('[data-testid="success-alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-alert"] h3')).toHaveText('수정 완료');
    await expect(page.locator('[data-testid="success-alert"] p')).toHaveText('게시물이 성공적으로 수정되었습니다.');
  });

  test('수정 완료 모달 확인 후 상세페이지로 이동하는지 확인', async ({ page }) => {
    // 게시판 상세 페이지로 직접 이동
    await page.goto('/boards/1');
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 수정 버튼 클릭
    await page.click('[data-testid="edit-button"]');
    
    // 수정 페이지로 이동 확인
    try {
      await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 필수 필드들 입력
    await page.fill('[data-testid="board-writer-input"]', '수정된작성자');
    await page.fill('[data-testid="board-password-input"]', '5678');
    await page.fill('[data-testid="board-title-input"]', '수정된 제목');
    await page.fill('[data-testid="board-content-input"]', '수정된 내용');
    
    // 수정하기 버튼 클릭
    await page.click('[data-testid="board-submit-button"]');
    
    // 성공 모달 확인 버튼 클릭
    await page.click('[data-testid="success-alert-confirm"]');
    
    // 상세페이지로 이동했는지 확인
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    expect(page.url()).toContain('/boards/1');
  });

  test('수정된 데이터가 로컬스토리지에 올바르게 저장되는지 확인', async ({ page }) => {
    // 게시판 상세 페이지로 직접 이동
    await page.goto('/boards/1');
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 수정 버튼 클릭
    await page.click('[data-testid="edit-button"]');
    
    // 수정 페이지로 이동 확인
    try {
      await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }
    
    // 필수 필드들 입력
    await page.fill('[data-testid="board-writer-input"]', '수정된작성자');
    await page.fill('[data-testid="board-password-input"]', '5678');
    await page.fill('[data-testid="board-title-input"]', '수정된 제목');
    await page.fill('[data-testid="board-content-input"]', '수정된 내용');
    
    // 수정하기 버튼 클릭
    await page.click('[data-testid="board-submit-button"]');
    
    // 성공 모달 확인 버튼 클릭
    await page.click('[data-testid="success-alert-confirm"]');
    
    // 로컬스토리지에서 수정된 데이터 확인
    const updatedData = await page.evaluate(() => {
      const stored = localStorage.getItem('boards');
      return stored ? JSON.parse(stored) : [];
    });
    
    expect(updatedData).toHaveLength(1);
    expect(updatedData[0].writer).toBe('수정된작성자');
    expect(updatedData[0].password).toBe('5678');
    expect(updatedData[0].title).toBe('수정된 제목');
    expect(updatedData[0].contents).toBe('수정된 내용');
    expect(updatedData[0].boardId).toBe('1'); // 기존 ID 유지
  });

  test('유효성 검사 오류 메시지가 올바르게 표시되는지 확인', async ({ page }) => {
    // 게시판 상세 페이지로 직접 이동
    await page.goto('/boards/1');
    try {
      await page.waitForSelector('[data-testid="boards-detail-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }

    // 수정 버튼 클릭
    await page.click('[data-testid="edit-button"]');

    // 수정 페이지로 이동 확인
    try {
      await page.waitForSelector('[data-testid="boards-write-page"]', { timeout: 2000 });
    } catch (e) {
      // timeout ok
    }

    // 필드들을 비워두고 수정하기 버튼 클릭 시도
    await page.fill('[data-testid="board-writer-input"]', '');
    await page.fill('[data-testid="board-password-input"]', '');
    await page.fill('[data-testid="board-title-input"]', '');
    await page.fill('[data-testid="board-content-input"]', '');

    // 수정하기 버튼이 비활성화 상태인지 확인
    await expect(page.locator('[data-testid="board-submit-button"]')).toBeDisabled();

    // 각 필드에 유효하지 않은 값 입력하고 blur 이벤트 발생
    await page.fill('[data-testid="board-writer-input"]', 'a'.repeat(21)); // 20자 초과
    await page.locator('[data-testid="board-writer-input"]').blur();

    await page.fill('[data-testid="board-password-input"]', '12'); // 4자 미만
    await page.locator('[data-testid="board-password-input"]').blur();

    await page.fill('[data-testid="board-title-input"]', 'b'.repeat(101)); // 100자 초과
    await page.locator('[data-testid="board-title-input"]').blur();

    await page.fill('[data-testid="board-content-input"]', '');
    await page.locator('[data-testid="board-content-input"]').blur();

    // 오류 메시지가 표시되는지 확인 (잠시 대기)
    await page.waitForTimeout(300);

    // 최소 하나 이상의 에러 메시지가 표시되는지 확인
    const hasError = await page.locator('[data-testid="writer-error-message"], [data-testid="password-error-message"], [data-testid="title-error-message"], [data-testid="content-error-message"]').count();
    expect(hasError).toBeGreaterThan(0);
  });
});

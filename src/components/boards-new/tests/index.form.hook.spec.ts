import { test, expect } from '@playwright/test';

test.describe('게시판 폼 등록 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 환경 설정 - 로그인 검사 우회
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });

    // /boards 페이지로 이동
    await page.goto('/boards');
    
    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-container"]');
    
    // 트립토크 버튼 클릭 (게시물 작성 페이지로 이동)
    await page.click('[data-testid="trip-talk-button"]');
    
    // 게시물 작성 페이지 로드 대기
    await page.waitForSelector('[data-testid="boards-write-page"]');
  });

  test('필수 필드 입력 시 등록하기 버튼이 활성화되어야 함', async ({ page }) => {
    // writer, password, title, contents 필드 입력
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용입니다.');
    
    // 등록하기 버튼이 활성화되었는지 확인
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await expect(submitButton).toBeEnabled();
  });

  test('필수 필드가 비어있으면 등록하기 버튼이 비활성화되어야 함', async ({ page }) => {
    // 등록하기 버튼이 비활성화되었는지 확인
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await expect(submitButton).toBeDisabled();
  });

  test('게시물 등록 성공 시나리오', async ({ page }) => {
    // 필수 필드 입력
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용입니다.');
    
    // 유튜브 URL 입력 (선택사항)
    await page.fill('[data-testid="board-youtube-input"]', 'https://www.youtube.com/watch?v=test');
    
    // 등록하기 버튼 클릭
    await page.click('[data-testid="board-submit-button"]');
    
    // 등록 완료 알림이 표시되는지 확인
    await expect(page.locator('[data-testid="success-alert"]')).toBeVisible();
    
    // 로컬스토리지에 데이터가 저장되었는지 확인
    const boardsData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('boards') || '[]');
    });
    
    expect(boardsData).toHaveLength(1);
    expect(boardsData[0]).toMatchObject({
      writer: '테스트작성자',
      password: '1234',
      title: '테스트 제목',
      contents: '테스트 내용입니다.',
      youtubeUrl: 'https://www.youtube.com/watch?v=test',
      boardId: '1',
      createdAt: expect.any(String)
    });
    
    // 등록 완료 알림 확인 버튼 클릭
    await page.click('[data-testid="success-alert-confirm"]');
    
    // 게시판 상세페이지로 리다이렉트되었는지 확인
    await expect(page).toHaveURL(/\/boards\/1$/);
  });

  test('기존 게시물이 있을 때 새 게시물 등록 시 ID가 증가해야 함', async ({ page }) => {
    // 기존 게시물 데이터를 로컬스토리지에 설정
    await page.evaluate(() => {
      localStorage.setItem('boards', JSON.stringify([
        {
          boardId: '1',
          writer: '기존작성자',
          password: '1234',
          title: '기존 제목',
          contents: '기존 내용',
          youtubeUrl: '',
          boardAddress: { zipcode: '', address: '', addressDetail: '' },
          images: [],
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]));
    });
    
    // 새 게시물 작성
    await page.fill('[data-testid="board-writer-input"]', '새작성자');
    await page.fill('[data-testid="board-password-input"]', '5678');
    await page.fill('[data-testid="board-title-input"]', '새 제목');
    await page.fill('[data-testid="board-content-input"]', '새 내용입니다.');
    
    await page.click('[data-testid="board-submit-button"]');
    
    // 로컬스토리지에 두 개의 게시물이 있는지 확인
    const boardsData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('boards') || '[]');
    });
    
    expect(boardsData).toHaveLength(2);
    expect(boardsData[1].boardId).toBe('2'); // ID가 2로 증가했는지 확인
  });

  test('폼 유효성 검사 - 작성자 필드', async ({ page }) => {
    // 필수 필드 모두 입력하여 버튼 활성화
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용');
    
    // 작성자 필드만 비우기
    await page.fill('[data-testid="board-writer-input"]', '');
    
    // 등록하기 버튼 클릭하여 유효성 검사 트리거 (비활성화된 버튼 강제 클릭)
    await page.click('[data-testid="board-submit-button"]', { force: true });
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="writer-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="writer-error-message"]')).toContainText('작성자를 입력해주세요.');
  });

  test('폼 유효성 검사 - 비밀번호 필드', async ({ page }) => {
    // 4자 미만 비밀번호 입력
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '123');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용');
    
    // 비밀번호 필드에 포커스 후 포커스 아웃
    await page.focus('[data-testid="board-password-input"]');
    await page.click('body'); // 다른 요소 클릭으로 포커스 아웃
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="password-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error-message"]')).toContainText('비밀번호는 4자 이상이어야 합니다.');
  });

  test('폼 유효성 검사 - 제목 필드', async ({ page }) => {
    // 필수 필드 모두 입력하여 버튼 활성화
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용');
    
    // 제목 필드만 비우기
    await page.fill('[data-testid="board-title-input"]', '');
    
    // 등록하기 버튼 클릭하여 유효성 검사 트리거 (비활성화된 버튼 강제 클릭)
    await page.click('[data-testid="board-submit-button"]', { force: true });
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="title-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-error-message"]')).toContainText('제목을 입력해주세요.');
  });

  test('폼 유효성 검사 - 내용 필드', async ({ page }) => {
    // 필수 필드 모두 입력하여 버튼 활성화
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용');
    
    // 내용 필드만 비우기
    await page.fill('[data-testid="board-content-input"]', '');
    
    // 등록하기 버튼 클릭하여 유효성 검사 트리거 (비활성화된 버튼 강제 클릭)
    await page.click('[data-testid="board-submit-button"]', { force: true });
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="content-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-error-message"]')).toContainText('내용을 입력해주세요.');
  });

  test('폼 유효성 검사 - 유튜브 URL 필드', async ({ page }) => {
    // 잘못된 유튜브 URL 입력
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용');
    await page.fill('[data-testid="board-youtube-input"]', 'invalid-url');
    
    // 유튜브 URL 필드에 포커스 후 포커스 아웃
    await page.focus('[data-testid="board-youtube-input"]');
    await page.click('body'); // 다른 요소 클릭으로 포커스 아웃
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="youtube-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="youtube-error-message"]')).toContainText('유효한 유튜브 URL을 입력해주세요.');
  });
});
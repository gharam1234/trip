import { test, expect } from '@playwright/test';

test.describe('게시판 폼 등록 기능 (Apollo 기반)', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 환경 설정 - 로그인 검사 우회
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });

    // /boards 페이지로 이동
    await page.goto('/boards');

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용, timeout 미설정)
    await page.waitForSelector('[data-testid="boards-container"]');

    // 트립토크 버튼 클릭 (게시물 작성 페이지로 이동)
    await page.click('[data-testid="trip-talk-button"]');

    // 게시물 작성 페이지 로드 대기 (data-testid 사용, timeout 미설정)
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

  test('게시물 등록 성공 시나리오 (실제 API 요청)', async ({ page }) => {
    // GraphQL 응답 모니터링
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/graphql') && response.request().method() === 'POST'
    );

    // 필수 필드 입력
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용입니다.');

    // 유튜브 URL 입력 (선택사항)
    await page.fill('[data-testid="board-youtube-input"]', 'https://www.youtube.com/watch?v=test');

    // 등록하기 버튼 클릭
    await page.click('[data-testid="board-submit-button"]');

    // GraphQL 응답 대기
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // 등록 완료 알림이 표시되는지 확인 (timeout 500ms 미만)
    await expect(page.locator('[data-testid="success-alert"]')).toBeVisible({ timeout: 500 });

    // 등록 완료 알림 확인 버튼 클릭
    await page.click('[data-testid="success-alert-confirm"]');

    // 게시판 상세페이지로 리다이렉트되었는지 확인
    // 응답에서 받은 _id로 리다이렉트되어야 함
    await expect(page).toHaveURL(/\/boards\/[a-zA-Z0-9]+$/);
  });

  test('게시물 등록 실패 시나리오 (잘못된 데이터)', async ({ page }) => {
    // 네트워크 오류 시뮬레이션을 위해 잘못된 데이터 입력
    // (서버가 거부할 수 있는 빈 writer나 짧은 password)
    await page.fill('[data-testid="board-writer-input"]', '');
    await page.fill('[data-testid="board-password-input"]', '');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용입니다.');

    // 등록하기 버튼이 비활성화되어 있는지 확인
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await expect(submitButton).toBeDisabled();
  });

  test('게시물 등록 실패 시나리오 (서버 에러)', async ({ page }) => {
    // GraphQL 요청을 가로채서 에러 응답 반환
    await page.route('**/graphql', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [{ message: 'Internal Server Error' }]
        })
      });
    });

    // 필수 필드 입력
    await page.fill('[data-testid="board-writer-input"]', '테스트작성자');
    await page.fill('[data-testid="board-password-input"]', '1234');
    await page.fill('[data-testid="board-title-input"]', '테스트 제목');
    await page.fill('[data-testid="board-content-input"]', '테스트 내용입니다.');

    // 등록하기 버튼 클릭
    await page.click('[data-testid="board-submit-button"]');

    // 등록 실패 알림이 표시되는지 확인 (timeout 500ms 미만)
    await expect(page.locator('[data-testid="failure-alert"]')).toBeVisible({ timeout: 500 });

    // 실패 알림 확인 버튼 클릭
    await page.click('[data-testid="failure-alert-confirm"]');

    // 페이지 이동이 없는지 확인 (여전히 게시물 작성 페이지에 있어야 함)
    await expect(page.locator('[data-testid="boards-write-page"]')).toBeVisible();
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
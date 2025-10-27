import { test, expect } from '@playwright/test';

test.describe('게시판 폼 수정 기능 (Apollo 기반)', () => {
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

    // 수정할 게시글의 상세페이지로 이동
    // 게시글 목록에서 첫 번째 게시글 클릭
    const firstBoardLink = page.locator('[data-testid="boards-list"] a').first();
    await firstBoardLink.click();

    // 게시글 상세페이지 로드 대기
    await page.waitForSelector('[data-testid="board-detail-page"]');

    // 수정 버튼 클릭하여 수정 페이지로 이동
    await page.click('[data-testid="board-edit-button"]');

    // 게시물 수정 페이지 로드 대기
    await page.waitForSelector('[data-testid="boards-write-page"]');
  });

  test('1. /boards/[BoardId] 접속 후 페이지 로드 확인', async ({ page }) => {
    // 게시물 수정 페이지가 로드되었는지 확인
    await expect(page.locator('[data-testid="boards-write-page"]')).toBeVisible();

    // 헤더 제목이 '게시물 수정'인지 확인
    const headerTitle = page.locator('[data-testid="boards-write-page"] h1').first();
    await expect(headerTitle).toContainText('게시물 수정');
  });

  test('2. writer, password, title, contents 인풋 입력 시 수정하기 버튼 활성화', async ({ page }) => {
    // 초기 페이지 로드 후 기존 데이터로 폼이 채워져 있을 것
    // 각 필드가 이미 값을 가지고 있으므로, 폼 검증이 활성화되어 있는지 확인

    const submitButton = page.locator('[data-testid="board-submit-button"]');

    // 모든 필드가 채워져 있으므로 버튼이 활성화되어야 함
    await expect(submitButton).toBeEnabled({ timeout: 500 });

    // 버튼 텍스트가 '수정하기'인지 확인
    await expect(submitButton).toContainText('수정하기');
  });

  test('3. 수정 중 입력값 변경 후 수정하기 버튼 클릭', async ({ page }) => {
    // password 필드 변경
    const passwordInput = page.locator('[data-testid="board-password-input"]');
    await passwordInput.clear();
    await passwordInput.fill('newpass1234');

    // title 필드 변경
    const titleInput = page.locator('[data-testid="board-title-input"]');
    await titleInput.clear();
    await titleInput.fill('수정된 제목');

    // contents 필드 변경
    const contentsInput = page.locator('[data-testid="board-content-input"]');
    await contentsInput.clear();
    await contentsInput.fill('수정된 내용입니다.');

    // 수정하기 버튼이 활성화되었는지 확인
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await expect(submitButton).toBeEnabled({ timeout: 500 });

    // GraphQL 응답 모니터링
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/graphql') && response.request().method() === 'POST'
    );

    // 수정하기 버튼 클릭
    await submitButton.click();

    // GraphQL 응답 대기
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  });

  test('4. 수정 완료 시 Modal 컴포넌트와 Modal Provider를 이용해 수정완료 모달 노출', async ({ page }) => {
    // password, title, contents 변경
    const passwordInput = page.locator('[data-testid="board-password-input"]');
    await passwordInput.clear();
    await passwordInput.fill('newpass1234');

    const titleInput = page.locator('[data-testid="board-title-input"]');
    await titleInput.clear();
    await titleInput.fill('수정된 제목');

    const contentsInput = page.locator('[data-testid="board-content-input"]');
    await contentsInput.clear();
    await contentsInput.fill('수정된 내용입니다.');

    // 수정하기 버튼 클릭
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await submitButton.click();

    // 수정 완료 알림 모달이 표시되는지 확인 (timeout 500ms 미만)
    await expect(page.locator('[data-testid="success-alert"]')).toBeVisible({ timeout: 500 });

    // 모달 제목 확인
    const successAlert = page.locator('[data-testid="success-alert"]');
    await expect(successAlert).toContainText('수정 완료');

    // 모달 메시지 확인
    await expect(successAlert).toContainText('게시물이 성공적으로 수정되었습니다.');
  });

  test('5. 모달 확인 시 상세페이지로 라우팅 및 다이나믹 라우팅 검증', async ({ page }) => {
    // password, title, contents 변경
    const passwordInput = page.locator('[data-testid="board-password-input"]');
    await passwordInput.clear();
    await passwordInput.fill('newpass1234');

    const titleInput = page.locator('[data-testid="board-title-input"]');
    await titleInput.clear();
    await titleInput.fill('수정된 제목');

    const contentsInput = page.locator('[data-testid="board-content-input"]');
    await contentsInput.clear();
    await contentsInput.fill('수정된 내용입니다.');

    // 수정하기 버튼 클릭
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await submitButton.click();

    // 수정 완료 알림 모달이 표시될 때까지 대기
    await expect(page.locator('[data-testid="success-alert"]')).toBeVisible({ timeout: 500 });

    // 확인 버튼 클릭
    const confirmButton = page.locator('[data-testid="success-alert"] button').first();
    await confirmButton.click();

    // 게시판 상세페이지로 리다이렉트되었는지 확인
    // 경로: /boards/[BoardId] 형식으로 이동
    await expect(page).toHaveURL(/\/boards\/[a-zA-Z0-9]+$/);

    // 상세페이지의 주요 요소가 표시되는지 확인
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible();
  });

  test('성공 시나리오: updateBoard Mutation 호출 성공 후 데이터 바인딩', async ({ page }) => {
    // GraphQL 응답 모니터링
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/graphql') && response.request().method() === 'POST'
    );

    // password, title, contents 변경
    const passwordInput = page.locator('[data-testid="board-password-input"]');
    await passwordInput.clear();
    await passwordInput.fill('newpass1234');

    const titleInput = page.locator('[data-testid="board-title-input"]');
    await titleInput.clear();
    await titleInput.fill('수정된 제목');

    const contentsInput = page.locator('[data-testid="board-content-input"]');
    await contentsInput.clear();
    await contentsInput.fill('수정된 내용입니다.');

    // youtubeUrl 추가 입력 (선택사항)
    const youtubeInput = page.locator('[data-testid="board-youtube-input"]');
    await youtubeInput.fill('https://www.youtube.com/watch?v=test123');

    // 수정하기 버튼 클릭
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await submitButton.click();

    // GraphQL 응답 대기
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // 응답 데이터 검증
    const responseBody = await response.json();
    expect(responseBody.data?.updateBoard).toBeDefined();
    expect(responseBody.data.updateBoard._id).toBeTruthy();
    expect(responseBody.data.updateBoard.title).toBe('수정된 제목');
    expect(responseBody.data.updateBoard.contents).toBe('수정된 내용입니다.');

    // 성공 모달 확인
    await expect(page.locator('[data-testid="success-alert"]')).toBeVisible({ timeout: 500 });
  });

  test('실패 시나리오: Mutation 호출 실패 처리', async ({ page }) => {
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

    // password, title, contents 변경
    const passwordInput = page.locator('[data-testid="board-password-input"]');
    await passwordInput.clear();
    await passwordInput.fill('newpass1234');

    const titleInput = page.locator('[data-testid="board-title-input"]');
    await titleInput.clear();
    await titleInput.fill('수정된 제목');

    const contentsInput = page.locator('[data-testid="board-content-input"]');
    await contentsInput.clear();
    await contentsInput.fill('수정된 내용입니다.');

    // 수정하기 버튼 클릭
    const submitButton = page.locator('[data-testid="board-submit-button"]');
    await submitButton.click();

    // 수정 실패 알림이 표시되는지 확인 (timeout 500ms 미만)
    await expect(page.locator('[data-testid="failure-alert"]')).toBeVisible({ timeout: 500 });

    // 실패 알림 메시지 확인
    const failureAlert = page.locator('[data-testid="failure-alert"]');
    await expect(failureAlert).toContainText('수정 실패');
    await expect(failureAlert).toContainText('게시물 수정에 실패했습니다.');

    // 실패 알림 확인 버튼 클릭
    const confirmButton = page.locator('[data-testid="failure-alert"] button').first();
    await confirmButton.click();

    // 페이지 이동이 없는지 확인 (여전히 게시물 수정 페이지에 있어야 함)
    await expect(page.locator('[data-testid="boards-write-page"]')).toBeVisible();

    // 사용자가 데이터를 다시 수정할 수 있도록 폼이 여전히 유효해야 함
    const resubmitButton = page.locator('[data-testid="board-submit-button"]');
    await expect(resubmitButton).toBeEnabled({ timeout: 500 });
  });

  test('필드 입력 시 수정하기 버튼 활성화 상태 변화 검증', async ({ page }) => {
    const submitButton = page.locator('[data-testid="board-submit-button"]');

    // 초기 상태: 기존 데이터로 활성화됨
    await expect(submitButton).toBeEnabled({ timeout: 500 });

    // password 필드를 비우면 버튼 비활성화
    const passwordInput = page.locator('[data-testid="board-password-input"]');
    await passwordInput.clear();

    // 버튼이 비활성화되었는지 확인
    await expect(submitButton).toBeDisabled({ timeout: 500 });

    // password 필드 다시 채우면 버튼 활성화
    await passwordInput.fill('newpass1234');
    await expect(submitButton).toBeEnabled({ timeout: 500 });

    // title 필드를 비우면 버튼 비활성화
    const titleInput = page.locator('[data-testid="board-title-input"]');
    await titleInput.clear();

    // 버튼이 비활성화되었는지 확인
    await expect(submitButton).toBeDisabled({ timeout: 500 });

    // title 필드 다시 채우면 버튼 활성화
    await titleInput.fill('수정된 제목');
    await expect(submitButton).toBeEnabled({ timeout: 500 });
  });

  test('취소 버튼 클릭하여 이전 페이지로 돌아가기', async ({ page }) => {
    // 취소 버튼 클릭
    const cancelButton = page.locator('[data-testid="cancel-button"]');
    await cancelButton.click();

    // 이전 페이지로 이동했는지 확인 (브라우저 뒤로가기 동작)
    // 상세페이지로 돌아가야 함
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible({ timeout: 500 });
  });
});

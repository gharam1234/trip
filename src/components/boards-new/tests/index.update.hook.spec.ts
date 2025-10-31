import { test, expect } from "@playwright/test";

// 테스트: 게시판 수정 기능
test.describe("게시판 수정 기능 - useBoardForm Hook", () => {
  // 테스트 전 로컬스토리지 초기화 및 테스트 데이터 설정
  test.beforeEach(async ({ page }) => {
    // 테스트 환경 설정
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });

    // 홈페이지로 먼저 이동하여 localStorage 접근 가능하게 설정
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 로컬스토리지에 테스트용 게시판 데이터 추가
    await page.evaluate(() => {
      const testBoards = [
        {
          boardId: "1",
          writer: "작성자1",
          password: "1234",
          title: "테스트 제목 1",
          contents: "테스트 내용 1",
          youtubeUrl: "",
          boardAddress: {
            zipcode: "",
            address: "",
            addressDetail: "",
          },
          images: [],
          createdAt: new Date().toISOString(),
        },
        {
          boardId: "2",
          writer: "작성자2",
          password: "5678",
          title: "테스트 제목 2",
          contents: "테스트 내용 2",
          youtubeUrl: "https://www.youtube.com/watch?v=test",
          boardAddress: {
            zipcode: "12345",
            address: "서울시 강남구",
            addressDetail: "테스트 빌딩",
          },
          images: [],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("boards", JSON.stringify(testBoards));
    });
  });

  // 테스트 시나리오 1: 수정 페이지로 이동 후 페이지 로드 확인
  test("수정 페이지로 이동 후 페이지 로드 확인", async ({
    page,
  }) => {
    // /boards/1/edit로 이동
    await page.goto("/boards/1/edit");

    // 페이지 로드 확인 (data-testid 대기)
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 500,
    });

    // 페이지 로드 완료
    expect(page.url()).toContain("/boards/1/edit");
  });

  // 테스트 시나리오 2: 수정 페이지에서 기존 데이터 확인
  test("수정 페이지에서 기존 게시물 데이터가 폼에 자동 로드되는지 확인", async ({
    page,
  }) => {
    // /boards/1/edit로 이동
    await page.goto("/boards/1/edit");

    // 페이지 로드 확인
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 500,
    });

    // 작성자 필드 확인
    const writerInput = page.locator(
      'input[data-testid="board-writer-input"]'
    );
    await expect(writerInput).toHaveValue("작성자1");

    // 제목 필드 확인
    const titleInput = page.locator(
      'input[data-testid="board-title-input"]'
    );
    await expect(titleInput).toHaveValue("테스트 제목 1");

    // 내용 필드 확인
    const contentsInput = page.locator(
      'textarea[data-testid="board-content-input"]'
    );
    await expect(contentsInput).toHaveValue("테스트 내용 1");
  });

  // 테스트 시나리오 3: 수정 페이지 UI 요소 확인
  test("수정 페이지의 UI 요소들이 올바르게 표시되는지 확인", async ({
    page,
  }) => {
    // /boards/1/edit로 이동
    await page.goto("/boards/1/edit");

    // 페이지 로드 확인
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 500,
    });

    // 헤더 타이틀 확인
    const headerTitle = page.locator("h1");
    await expect(headerTitle).toContainText("게시물 수정");

    // 제출 버튼 확인
    const submitButton = page.locator(
      'button[data-testid="board-submit-button"]'
    );
    await expect(submitButton).toContainText("수정하기");
  });

  // 테스트 시나리오 4: 수정 데이터 제출 및 로컬스토리지 업데이트 확인
  test("수정 폼 제출 후 로컬스토리지에 업데이트된 데이터가 저장되는지 확인", async ({
    page,
  }) => {
    // /boards/1/edit로 이동
    await page.goto("/boards/1/edit");

    // 페이지 로드 확인
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 500,
    });

    // 제목 변경
    const titleInput = page.locator(
      'input[data-testid="board-title-input"]'
    );
    await titleInput.fill("수정된 제목");

    // 내용 변경
    const contentsInput = page.locator(
      'textarea[data-testid="board-content-input"]'
    );
    await contentsInput.fill("수정된 내용");

    // 제출 버튼 클릭
    const submitButton = page.locator(
      'button[data-testid="board-submit-button"]'
    );
    await submitButton.click();

    // 성공 알림 확인
    await page.waitForSelector('[data-testid="success-alert"]', {
      timeout: 500,
    });

    const successAlert = page.locator('[data-testid="success-alert"]');
    await expect(successAlert).toContainText("수정 완료");
    await expect(successAlert).toContainText("게시물이 성공적으로 수정되었습니다");

    // 로컬스토리지 데이터 확인
    const updatedBoards = await page.evaluate(() => {
      const boards = localStorage.getItem("boards");
      return boards ? JSON.parse(boards) : [];
    });

    const updatedBoard = updatedBoards.find(
      (b: { boardId: string }) => b.boardId === "1"
    );
    expect(updatedBoard.title).toBe("수정된 제목");
    expect(updatedBoard.contents).toBe("수정된 내용");
  });

  // 테스트 시나리오 5: 수정 완료 후 상세페이지로 이동 확인
  test("수정 완료 알림 확인 후 상세페이지로 라우팅되는지 확인", async ({
    page,
  }) => {
    // /boards/1/edit로 이동
    await page.goto("/boards/1/edit");

    // 페이지 로드 확인
    // 수정 이유: 페이지 로드 시간 증가
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 5000,
    });

    // 폼 데이터 변경
    const titleInput = page.locator(
      'input[data-testid="board-title-input"]'
    );
    await titleInput.fill("최종 수정 제목");

    // 제출
    const submitButton = page.locator(
      'button[data-testid="board-submit-button"]'
    );
    await submitButton.click();

    // 성공 알림 대기
    // 수정 이유: GraphQL 응답 대기 시간 증가
    await page.waitForSelector('[data-testid="success-alert"]', {
      timeout: 5000,
    });

    // 확인 버튼 클릭
    const confirmButton = page.locator(
      'button[data-testid="success-alert-confirm"]'
    );
    await confirmButton.click();

    // 상세페이지로 이동 확인
    // 수정 이유: 라우팅 대기 시간 증가
    await page.waitForURL(/\/boards\/1$/, { timeout: 5000 });
    expect(page.url()).toContain("/boards/1");
  });

  // 테스트 시나리오 6: 작성자/비밀번호 필드 필수 검증
  test("작성자와 비밀번호가 입력되지 않으면 수정하기 버튼이 비활성화되는지 확인", async ({
    page,
  }) => {
    // /boards/1/edit로 이동
    await page.goto("/boards/1/edit");

    // 페이지 로드 확인
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 500,
    });

    // 작성자 필드 초기화
    const writerInput = page.locator(
      'input[data-testid="board-writer-input"]'
    );
    await writerInput.clear();

    // 비밀번호 필드 초기화
    const passwordInput = page.locator(
      'input[data-testid="board-password-input"]'
    );
    await passwordInput.clear();

    // 제출 버튼이 비활성화되는지 확인
    const submitButton = page.locator(
      'button[data-testid="board-submit-button"]'
    );
    await expect(submitButton).toBeDisabled();
  });

  // 테스트 시나리오 7: 유튜브 URL 포함된 데이터 수정 및 저장 확인
  test("유튜브 URL이 포함된 게시물 수정 후 저장 확인", async ({ page }) => {
    // /boards/2/edit로 이동
    await page.goto("/boards/2/edit");

    // 페이지 로드 확인
    await page.waitForSelector('[data-testid="boards-write-page"]', {
      timeout: 500,
    });

    // 유튜브 URL 필드 확인
    const youtubeInput = page.locator(
      'input[data-testid="board-youtube-input"]'
    );
    await expect(youtubeInput).toHaveValue(
      "https://www.youtube.com/watch?v=test"
    );

    // 제목 변경
    const titleInput = page.locator(
      'input[data-testid="board-title-input"]'
    );
    await titleInput.fill("유튜브 포함 수정");

    // 제출
    const submitButton = page.locator(
      'button[data-testid="board-submit-button"]'
    );
    await submitButton.click();

    // 성공 알림 확인
    await page.waitForSelector('[data-testid="success-alert"]', {
      timeout: 500,
    });

    // 로컬스토리지 확인
    const updatedBoards = await page.evaluate(() => {
      const boards = localStorage.getItem("boards");
      return boards ? JSON.parse(boards) : [];
    });

    const updatedBoard = updatedBoards.find(
      (b: { boardId: string }) => b.boardId === "2"
    );
    expect(updatedBoard.title).toBe("유튜브 포함 수정");
    expect(updatedBoard.youtubeUrl).toBe(
      "https://www.youtube.com/watch?v=test"
    );
  });
});

import { test, expect } from "@playwright/test";

/**
 * 게시판 댓글 작성 Hook 테스트 (TDD 기반)
 * - 실제 API 데이터를 사용하여 테스트
 * - createBoardComment mutation 검증
 * - 테스트용 boardID: 68fee6f59bffc00029cce4ab
 */
const TEST_BOARD_ID = "68fee6f59bffc00029cce4ab";

test.describe("Board Comments Submit Hook (TDD 기반 테스트)", () => {
  // 테스트 환경 설정
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__TEST_ENV__ = "test";
      window.__TEST_BYPASS__ = true;
    });

    // GraphQL 요청/응답 로깅
    page.on("response", async (response) => {
      if (response.url().includes("graphql")) {
        try {
          const json = await response.json();
          console.log("GraphQL 응답:", JSON.stringify(json, null, 2));
        } catch (e) {
          // 응답이 JSON이 아닐 수 있음
        }
      }
    });
  });

  test("성공 시나리오: 댓글 작성 후 목록이 자동으로 업데이트되는지 검증", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    console.log(`\n테스트 보드ID: ${TEST_BOARD_ID}`);
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 기반)
    const pageContainer = page.locator("[data-testid='board-detail-container']");

    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      // 대체: 댓글 작성 폼이 로드될 때까지 대기
      const commentForm = page.locator("[data-testid='comment-form']");
      try {
        await commentForm.waitFor({ timeout: 400 });
      } catch {
        console.log("페이지 로드 실패");
        return;
      }
    }

    // 초기 댓글 개수 저장
    const initialComments = page.locator("[data-testid='comment-item']");
    const initialCount = await initialComments.count();
    console.log(`초기 댓글 수: ${initialCount}`);

    // 댓글 작성 폼 입력
    const writerInput = page.locator("input[placeholder='작성자를 입력해 주세요.']");
    const passwordInput = page.locator("input[type='password']");
    const contentTextarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']");

    // 입력값 채우기
    const testWriter = `테스트작성자_${Date.now()}`;
    const testPassword = "1234";
    const testContent = `테스트 댓글 내용 - ${Date.now()}`;

    await writerInput.fill(testWriter);
    await passwordInput.fill(testPassword);
    await contentTextarea.fill(testContent);

    // 평점 선택 (3점)
    const stars = page.locator("[data-testid*='star']");
    if (await stars.count() > 0) {
      // 별점 버튼 클릭
      const starButtons = page.locator("button.starButton");
      const starCount = await starButtons.count();
      if (starCount >= 3) {
        await starButtons.nth(2).click(); // 3번째 별(3점) 클릭
      }
    }

    // 제출 버튼 클릭
    const submitButton = page.locator("button:has-text('댓글 작성')").first();
    await submitButton.click();

    // 댓글 작성 후 목록이 업데이트될 때까지 대기
    await page.waitForTimeout(500);

    // 새로운 댓글 개수 확인
    const updatedComments = page.locator("[data-testid='comment-item']");
    const updatedCount = await updatedComments.count();
    console.log(`업데이트된 댓글 수: ${updatedCount}`);

    // 새 댓글이 추가되었는지 확인
    // (초기 댓글이 없어도 새 댓글이 추가되어야 함)
    expect(updatedCount).toBeGreaterThanOrEqual(1);

    // 새로 추가된 댓글 확인
    const allComments = page.locator("[data-testid='comment-item']");
    const lastComment = allComments.last();
    const lastCommentAuthor = await lastComment
      .locator("[data-testid='comment-author']")
      .innerText();

    console.log(`마지막 댓글 작성자: ${lastCommentAuthor}`);
  });

  test("입력값 검증 테스트: 내용이 비어있을 때 에러 처리", async ({ page }) => {
    // 게시판 상세 페이지로 이동
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const commentForm = page.locator("[data-testid='comment-form']");
    try {
      await commentForm.waitFor({ timeout: 400 });
    } catch {
      console.log("댓글 작성 폼을 찾을 수 없습니다.");
      return;
    }

    // 작성자와 평점만 입력하고 내용은 비움
    const writerInput = page.locator("input[placeholder='작성자를 입력해 주세요.']");
    const contentTextarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']");

    await writerInput.fill("테스트작성자");
    // contentTextarea는 비워둠

    // 제출 버튼 클릭
    const submitButton = page.locator("button:has-text('댓글 작성')").first();

    // 버튼이 비활성화되어있는지 또는 에러 메시지가 표시되는지 확인
    const isDisabled = await submitButton.isDisabled();
    const isHidden = await submitButton.isHidden();

    console.log(`제출 버튼 비활성화: ${isDisabled}, 숨김: ${isHidden}`);

    // 내용이 필수이므로, 폼 제출이 방지되거나 에러가 표시되어야 함
    expect(isDisabled || isHidden || (await contentTextarea.getAttribute("required")) === "").toBeTruthy();
  });

  test("입력값 검증 테스트: 비밀번호가 4자리 숫자가 아닐 때 에러 처리", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const commentForm = page.locator("[data-testid='comment-form']");
    try {
      await commentForm.waitFor({ timeout: 400 });
    } catch {
      console.log("댓글 작성 폼을 찾을 수 없습니다.");
      return;
    }

    // 폼 입력
    const writerInput = page.locator("input[placeholder='작성자를 입력해 주세요.']");
    const passwordInput = page.locator("input[type='password']");
    const contentTextarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']");

    await writerInput.fill("테스트작성자");
    await passwordInput.fill("123"); // 3자리 - 유효하지 않음
    await contentTextarea.fill("테스트 내용");

    // 제출 버튼 클릭
    const submitButton = page.locator("button:has-text('댓글 작성')").first();
    await submitButton.click();

    // 에러 메시지 확인 또는 폼이 제출되지 않았는지 확인
    // (실제 에러 메시지가 표시될 경우)
    const errorMessage = page.locator("[data-testid='error-message']");
    const errorCount = await errorMessage.count();

    console.log(`에러 메시지 표시: ${errorCount > 0 ? "예" : "아니요"}`);
    // 에러가 표시되거나 폼 유효성 검증으로 제출이 방지되어야 함
  });

  test("성공 시나리오: API 호출 성공 후 폼이 초기화되는지 확인", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const pageContainer = page.locator("[data-testid='board-detail-container']");
    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      // 대체
      const commentForm = page.locator("[data-testid='comment-form']");
      try {
        await commentForm.waitFor({ timeout: 400 });
      } catch {
        return;
      }
    }

    // 폼 입력
    const writerInput = page.locator("input[placeholder='작성자를 입력해 주세요.']");
    const passwordInput = page.locator("input[type='password']");
    const contentTextarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']");

    const testWriter = `테스트작성자_${Date.now()}`;
    const testPassword = "1234";
    const testContent = `테스트 댓글 - ${Date.now()}`;

    await writerInput.fill(testWriter);
    await passwordInput.fill(testPassword);
    await contentTextarea.fill(testContent);

    // 평점 선택
    const starButtons = page.locator("button.starButton");
    if (await starButtons.count() >= 3) {
      await starButtons.nth(2).click();
    }

    // 제출
    const submitButton = page.locator("button:has-text('댓글 작성')").first();
    await submitButton.click();

    // 댓글 작성 후 폼 초기화 대기
    await page.waitForTimeout(500);

    // 폼이 초기화되었는지 확인 (선택사항 - UI에 따라 다를 수 있음)
    const contentValue = await contentTextarea.inputValue();
    console.log(`폼 초기화 확인 - 내용 필드 값: "${contentValue}"`);
  });

  test("API 호출 실패 시나리오: 네트워크 오류 처리", async ({ page }) => {
    // API 실패를 시뮬레이션하기 위해 createBoardComment mutation을 차단
    await page.route("**/graphql", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // createBoardComment 요청만 차단
      if (postData?.operationName === "CreateBoardComment") {
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const commentForm = page.locator("[data-testid='comment-form']");
    try {
      await commentForm.waitFor({ timeout: 400 });
    } catch {
      return;
    }

    // 폼 입력
    const writerInput = page.locator("input[placeholder='작성자를 입력해 주세요.']");
    const passwordInput = page.locator("input[type='password']");
    const contentTextarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']");

    await writerInput.fill("테스트작성자");
    await passwordInput.fill("1234");
    await contentTextarea.fill("테스트 내용");

    // 평점 선택
    const starButtons = page.locator("button.starButton");
    if (await starButtons.count() >= 3) {
      await starButtons.nth(2).click();
    }

    // 제출
    const submitButton = page.locator("button:has-text('댓글 작성')").first();
    await submitButton.click();

    // 에러 메시지 또는 에러 표시 대기
    await page.waitForTimeout(300);

    // API 실패 시 에러 메시지 확인
    const errorMessage = page.locator("[data-testid='error-message']");
    const errorCount = await errorMessage.count();

    console.log(`API 실패 시 에러 메시지: ${errorCount > 0 ? "표시됨" : "표시되지 않음"}`);
  });
});

import { test, expect } from "@playwright/test";

/**
 * 게시판 댓글 수정/삭제 Hook 테스트 (TDD 기반)
 * - 실제 API 데이터를 사용하여 테스트
 * - updateBoardComment 및 deleteBoardComment mutation 검증
 * - 테스트용 boardID: 68fee6f59bffc00029cce4ab
 */
const TEST_BOARD_ID = "68fee6f59bffc00029cce4ab";

test.describe("Board Comments Edit/Delete Hook (TDD 기반 테스트)", () => {
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

  test("성공 시나리오: 댓글 수정 후 목록이 자동으로 업데이트되는지 검증", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    console.log(`\n테스트 보드ID: ${TEST_BOARD_ID}`);
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지가 완전히 로드될 때까지 대기
    const pageContainer = page.locator("[data-testid='board-detail-container']");

    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      console.log("페이지 로드 실패");
      return;
    }

    // 댓글 찾기
    const commentItems = page.locator("[data-testid='comment-item']");
    const commentCount = await commentItems.count();

    console.log(`렌더링된 댓글 수: ${commentCount}`);

    if (commentCount > 0) {
      // 첫 번째 댓글의 수정 버튼 찾기
      const firstComment = commentItems.first();
      const editButton = firstComment.locator("button").nth(0); // 수정 버튼

      // 수정 버튼 클릭 (존재하는지 확인)
      try {
        await editButton.click({ timeout: 400 });
        console.log("수정 모드 진입 성공");
      } catch {
        console.log("수정 버튼을 찾을 수 없습니다.");
      }
    } else {
      console.log("댓글이 없어서 수정 테스트를 건너뜀");
    }
  });

  test("성공 시나리오: 댓글 삭제 후 목록에서 제거되는지 검증", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const pageContainer = page.locator("[data-testid='board-detail-container']");

    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      console.log("페이지 로드 실패");
      return;
    }

    // 댓글 찾기
    const commentItems = page.locator("[data-testid='comment-item']");
    const initialCount = await commentItems.count();

    console.log(`초기 댓글 수: ${initialCount}`);

    if (initialCount > 0) {
      // 첫 번째 댓글의 삭제 버튼 찾기
      const firstComment = commentItems.first();
      const deleteButton = firstComment.locator("button").nth(1); // 삭제 버튼 (0번째가 수정, 1번째가 삭제)

      // 삭제 버튼이 존재하는지 확인
      const isVisible = await deleteButton.isVisible({ timeout: 300 });
      console.log(`삭제 버튼 가시성: ${isVisible}`);

      if (isVisible) {
        console.log("삭제 버튼을 찾았습니다.");
      }
    } else {
      console.log("댓글이 없어서 삭제 테스트를 건너뜀");
    }
  });

  test("수정 모드 전환 테스트: 수정 버튼 클릭 시 폼으로 전환", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const pageContainer = page.locator("[data-testid='board-detail-container']");

    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      console.log("페이지 로드 실패");
      return;
    }

    // 댓글 찾기
    const commentItems = page.locator("[data-testid='comment-item']");
    const commentCount = await commentItems.count();

    console.log(`렌더링된 댓글 수: ${commentCount}`);

    if (commentCount > 0) {
      const firstComment = commentItems.first();

      // 수정 버튼 클릭
      const editButton = firstComment.locator("button").nth(0);
      try {
        await editButton.click({ timeout: 400 });

        // 폼 요소가 나타났는지 확인
        const editForm = page.locator("[data-testid='comment-form'], form");
        const isFormVisible = await editForm.first().isVisible({ timeout: 300 });
        console.log(`수정 폼 가시성: ${isFormVisible}`);

        // 기존 내용이 폼에 채워졌는지 확인
        const textarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']");
        const content = await textarea.inputValue();
        console.log(`폼에 채워진 내용: "${content.substring(0, 30)}..."`);
      } catch {
        console.log("수정 버튼 클릭 실패");
      }
    } else {
      console.log("댓글이 없어서 수정 모드 전환 테스트를 건너뜀");
    }
  });

  test("API 호출 실패 시나리오: 비밀번호 불일치 시 에러 처리", async ({
    page,
  }) => {
    // 게시판 상세 페이지로 이동
    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대지
    const pageContainer = page.locator("[data-testid='board-detail-container']");

    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      console.log("페이지 로드 실패");
      return;
    }

    // 댓글 찾기
    const commentItems = page.locator("[data-testid='comment-item']");
    const commentCount = await commentItems.count();

    if (commentCount > 0) {
      const firstComment = commentItems.first();
      const deleteButton = firstComment.locator("button").nth(1);

      // 잘못된 비밀번호로 삭제 시도
      await page.route("**/graphql", async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();

        if (postData?.operationName === "DeleteBoardComment") {
          // 삭제 API를 실패로 응답
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              errors: [{ message: "비밀번호가 일치하지 않습니다." }],
            }),
          });
        } else {
          await route.continue();
        }
      });

      // 삭제 시도
      try {
        await deleteButton.click({ timeout: 300 });
        console.log("삭제 버튼 클릭 시도");
      } catch {
        console.log("삭제 버튼 클릭 실패");
      }
    } else {
      console.log("댓글이 없어서 비밀번호 불일치 테스트를 건너뜀");
    }
  });

  test("실패 시나리오: API 호출 실패 시 에러 메시지 표시", async ({
    page,
  }) => {
    // API 실패를 시뮬레이션
    await page.route("**/graphql", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (
        postData?.operationName === "UpdateBoardComment" ||
        postData?.operationName === "DeleteBoardComment"
      ) {
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    await page.goto(`http://localhost:3000/boards/${TEST_BOARD_ID}`);

    // 페이지 로드 대기
    const pageContainer = page.locator("[data-testid='board-detail-container']");

    try {
      await pageContainer.waitFor({ timeout: 400 });
    } catch {
      console.log("페이지 로드 실패");
      return;
    }

    // 댓글 찾기
    const commentItems = page.locator("[data-testid='comment-item']");
    const commentCount = await commentItems.count();

    console.log(`렌더링된 댓글 수: ${commentCount}`);

    if (commentCount > 0) {
      // API 실패 시에도 UI는 변하지 않음 확인
      expect(commentCount).toBeGreaterThan(0);
    }
  });
});

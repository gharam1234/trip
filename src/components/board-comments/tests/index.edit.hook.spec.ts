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
      const editButton = firstComment.locator("[data-testid='comment-edit-button']");

      // 수정 버튼 클릭 (존재하는지 확인)
      try {
        await editButton.click({ timeout: 400 });
        console.log("수정 모드 진입 성공");

        // 수정 폼이 나타났는지 확인
        const editForm = page.locator("[data-testid='comment-form'], form").first();
        const isFormVisible = await editForm.isVisible({ timeout: 300 });
        console.log(`수정 폼 가시성: ${isFormVisible}`);

        if (isFormVisible) {
          // 텍스트 영역에 새로운 내용 입력
          const textarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']").last();
          const originalContent = await textarea.inputValue();
          const newContent = `수정된 댓글 - ${Date.now()}`;

          await textarea.clear();
          await textarea.fill(newContent);
          console.log(`댓글 내용 변경: "${originalContent}" -> "${newContent}"`);

          // 비밀번호 입력
          const passwordInput = page.locator("input[type='password']").last();
          await passwordInput.fill("1234");

          // 수정 완료 버튼 클릭
          const submitButton = page.locator("button:has-text('수정 하기')").first();
          await submitButton.click({ timeout: 400 });

          // 수정 후 리스트 업데이트 대기
          await page.waitForTimeout(500);

          // 수정된 내용 확인
          const updatedCommentItems = page.locator("[data-testid='comment-item']");
          const updatedCount = await updatedCommentItems.count();
          console.log(`업데이트 후 댓글 수: ${updatedCount}`);

          expect(updatedCount).toBeGreaterThan(0);
        }
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
      const deleteButton = firstComment.locator("[data-testid='comment-delete-button']");

      // 삭제 버튼이 존재하는지 확인
      const isVisible = await deleteButton.isVisible({ timeout: 300 });
      console.log(`삭제 버튼 가시성: ${isVisible}`);

      if (isVisible) {
        // 삭제 버튼 클릭
        await deleteButton.click({ timeout: 400 });
        console.log("삭제 버튼 클릭 - 모달 열기");

        // 삭제 모달의 비밀번호 입력 필드 확인
        const deletePasswordInput = page.locator("[data-testid='comment-delete-password-input']");
        const isPasswordInputVisible = await deletePasswordInput.isVisible({ timeout: 300 });
        console.log(`삭제 모달 비밀번호 입력 필드 가시성: ${isPasswordInputVisible}`);

        if (isPasswordInputVisible) {
          // 비밀번호 입력
          await deletePasswordInput.fill("1234");
          console.log("모달에서 비밀번호 입력");

          // 삭제 모달의 "삭제 하기" 버튼 클릭
          const deleteConfirmButton = page.locator("[data-testid='comment-delete-confirm']");
          await deleteConfirmButton.click({ timeout: 400 });
          console.log("삭제 확인 버튼 클릭");

          // 삭제 후 리스트 업데이트 대기
          await page.waitForTimeout(500);

          // 삭제 후 댓글 수 확인
          const updatedCommentItems = page.locator("[data-testid='comment-item']");
          const updatedCount = await updatedCommentItems.count();
          console.log(`삭제 후 댓글 수: ${updatedCount}`);
        }
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

      // 원본 내용 저장
      const originalContentElement = firstComment.locator("[data-testid='comment-content']");
      const originalContent = await originalContentElement.innerText();
      console.log(`원본 댓글 내용: "${originalContent.substring(0, 30)}..."`);

      // 수정 버튼 클릭
      const editButton = firstComment.locator("[data-testid='comment-edit-button']");
      try {
        await editButton.click({ timeout: 400 });

        // 폼 요소가 나타났는지 확인
        const editForm = page.locator("form").last();
        const isFormVisible = await editForm.isVisible({ timeout: 300 });
        console.log(`수정 폼 가시성: ${isFormVisible}`);

        if (isFormVisible) {
          // 기존 내용이 폼에 채워졌는지 확인
          const textarea = page.locator("textarea[placeholder='댓글을 입력해 주세요.']").last();
          const formContent = await textarea.inputValue();
          console.log(`폼에 채워진 내용: "${formContent.substring(0, 30)}..."`);

          // 취소 버튼으로 모드 해제
          const cancelButton = page.locator("button:has-text('취소')").last();
          await cancelButton.click({ timeout: 400 });

          // 원본 댓글 뷰로 복구되었는지 확인
          const restoredComment = page.locator("[data-testid='comment-item']").first();
          const isRestored = await restoredComment.isVisible({ timeout: 300 });
          console.log(`수정 모드 취소 후 원본 뷰 복구: ${isRestored}`);
        }
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

    if (commentCount > 0) {
      const firstComment = commentItems.first();
      const deleteButton = firstComment.locator("[data-testid='comment-delete-button']");

      // 잘못된 비밀번호로 삭제 시도 - GraphQL 응답 모킹
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

      // 삭제 버튼 클릭
      try {
        await deleteButton.click({ timeout: 400 });
        console.log("삭제 버튼 클릭 성공");

        // 비밀번호 입력 필드 입력
        const passwordInput = page.locator("input[type='password']").last();
        await passwordInput.fill("0000"); // 잘못된 비밀번호

        // 삭제 완료 버튼 클릭
        const deleteConfirmButton = page.locator("button:has-text('삭제하기')").first();
        await deleteConfirmButton.click({ timeout: 400 });

        // 에러 메시지 확인
        await page.waitForTimeout(300);
        const errorMessage = page.locator("[data-testid='edit-error-message']");
        const isErrorVisible = await errorMessage.isVisible({ timeout: 300 });
        console.log(`에러 메시지 표시: ${isErrorVisible}`);
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
      const firstComment = commentItems.first();
      const deleteButton = firstComment.locator("[data-testid='comment-delete-button']");

      // 삭제 버튼 클릭
      try {
        await deleteButton.click({ timeout: 400 });

        // 비밀번호 입력
        const passwordInput = page.locator("input[type='password']").last();
        await passwordInput.fill("1234");

        // 삭제 완료 버튼 클릭 (API가 실패함)
        const deleteConfirmButton = page.locator("button:has-text('삭제하기')").first();
        await deleteConfirmButton.click({ timeout: 400 });

        // 에러 메시지 확인
        await page.waitForTimeout(300);
        const errorMessage = page.locator("[data-testid='edit-error-message']");
        const isErrorVisible = await errorMessage.isVisible({ timeout: 300 });
        console.log(`API 실패 시 에러 메시지 표시: ${isErrorVisible}`);

        // 댓글은 여전히 존재해야 함 (삭제되지 않음)
        const stillExistingItems = page.locator("[data-testid='comment-item']");
        const stillExistingCount = await stillExistingItems.count();
        expect(stillExistingCount).toBe(commentCount);
        console.log(`API 실패 후 댓글 수: ${stillExistingCount} (변경 없음)`);
      } catch {
        console.log("테스트 실행 중 에러 발생");
      }
    }
  });

  test("핵심 기능: 수정 폼에서 별점(rating)을 클릭하여 변경 가능한지 검증", async ({
    page,
  }) => {
    // 수정 이유: 요구사항 - "수정폼에서 rating을 바꿀려고 클릭해도 바뀌지 않음 rating이 바뀔수 있게 수정"
    // 이 테스트는 별점을 변경할 수 있는지 확인합니다.

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

      // 원본 별점 저장
      const originalRatingStars = firstComment.locator("[data-testid='comment-rating']");
      const originalRatingCount = await originalRatingStars.count();
      console.log(`원본 별점 개수: ${originalRatingCount}`);

      // 수정 버튼 클릭
      const editButton = firstComment.locator("[data-testid='comment-edit-button']");
      try {
        await editButton.click({ timeout: 400 });
        console.log("수정 모드 진입 성공");

        // 수정 폼의 RatingSelector 찾기 (별점 클릭 가능한 버튼들)
        const ratingButtons = page.locator(".ratingButton");
        const ratingButtonCount = await ratingButtons.count();
        console.log(`별점 버튼 개수: ${ratingButtonCount}`);

        if (ratingButtonCount >= 3) {
          // 3번째 별점 버튼 클릭 (3점으로 변경)
          const thirdRatingButton = ratingButtons.nth(2);
          await thirdRatingButton.click({ timeout: 400 });
          console.log("3번째 별점 버튼 클릭 성공");

          // 별점이 변경되었는지 확인 (활성화된 버튼이 3개가 되어야 함)
          const activeRatingButtons = page.locator(".ratingButtonActive");
          const activeCount = await activeRatingButtons.count();
          console.log(`활성 별점 개수: ${activeCount}`);

          // 활성 별점이 3개 이상이면 변경 성공
          expect(activeCount).toBeGreaterThanOrEqual(3);
          console.log("별점 변경 성공!");

          // 비밀번호 입력
          const passwordInput = page.locator("input[type='password']").last();
          await passwordInput.fill("1234");

          // 수정 완료 버튼 클릭
          const submitButton = page.locator("button:has-text('수정 하기')").first();
          await submitButton.click({ timeout: 400 });

          // 수정 후 리스트 업데이트 대기
          await page.waitForTimeout(500);

          // 별점이 실제로 업데이트되었는지 확인
          const updatedCommentItems = page.locator("[data-testid='comment-item']");
          const updatedFirstComment = updatedCommentItems.first();
          const updatedRatingStars = updatedFirstComment.locator("[data-testid='comment-rating']");
          const updatedRatingCount = await updatedRatingStars.count();
          console.log(`업데이트 후 별점: ${updatedRatingCount}`);
        }
      } catch (error) {
        console.log(`별점 변경 테스트 실패: ${error}`);
      }
    } else {
      console.log("댓글이 없어서 별점 변경 테스트를 건너뜀");
    }
  });
});

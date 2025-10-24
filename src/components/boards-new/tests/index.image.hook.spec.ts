import { test, expect } from "@playwright/test";

/**
 * 이미지 업로드 기능 테스트
 *
 * 테스트 항목:
 * 1. 파일 선택 시 imageUrls 상태가 업데이트되는지 확인
 * 2. 삭제 버튼 클릭 시 해당 이미지가 제거되는지 확인
 * 3. 클릭 시 input 트리거가 정상적으로 호출되는지 확인
 */

test.describe("boards-new - 이미지 업로드 기능", () => {
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

    // 게시물 작성 페이지 로드 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-write-page"]');
  });

  test("파일 선택 시 imageUrls 상태가 업데이트되는지 확인", async ({ page }) => {
    // 첫 번째 이미지 업로드 영역 찾기
    const firstImageInput = page.locator('input[id="fileInput_0"]');

    // 파일 선택 전 - 기본 이미지가 표시되는지 확인
    const defaultImage = page.locator('img[alt="사진업로드"]').first();
    await expect(defaultImage).toBeVisible();

    // 파일 업로드 - 테스트용 이미지 파일 생성
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    await firstImageInput.setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer,
    });

    // 파일 선택 후 - 업로드된 이미지가 표시되는지 확인
    const uploadedImage = page.locator('img[alt="업로드된 이미지 1"]');
    await expect(uploadedImage).toBeVisible();

    // 삭제 버튼이 표시되는지 확인
    const deleteButton = page.locator('[data-testid="delete-image-btn-0"]');
    await expect(deleteButton).toBeVisible();
  });

  test("삭제 버튼 클릭 시 해당 이미지가 제거되는지 확인", async ({ page }) => {
    // 첫 번째 이미지 업로드
    const firstImageInput = page.locator('input[id="fileInput_0"]');
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    await firstImageInput.setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer,
    });

    // 업로드된 이미지 확인
    const uploadedImage = page.locator('img[alt="업로드된 이미지 1"]');
    await expect(uploadedImage).toBeVisible();

    // 삭제 버튼 클릭
    const deleteButton = page.locator('[data-testid="delete-image-btn-0"]');
    await deleteButton.click();

    // 삭제 후 - 기본 이미지가 다시 표시되는지 확인
    const defaultImage = page.locator('img[alt="사진업로드"]').first();
    await expect(defaultImage).toBeVisible();

    // 업로드된 이미지가 제거되었는지 확인
    await expect(uploadedImage).not.toBeVisible();
  });

  test("클릭 시 input 트리거가 정상적으로 호출되는지 확인", async ({ page }) => {
    // 첫 번째 gray box (클릭 가능한 영역) 찾기
    const grayBox = page.locator('div[style*="cursor: pointer"]').first();

    // input 요소 참조
    const fileInput = page.locator('input[id="fileInput_0"]');

    // input이 숨겨져 있는지 확인
    await expect(fileInput).toHaveCSS("display", "none");

    // gray box 클릭 시 파일 선택 다이얼로그가 트리거되는지 확인
    // (실제 다이얼로그는 테스트 환경에서 열리지 않지만, input.click()이 호출되었는지 확인)
    const fileChooserPromise = page.waitForEvent("filechooser");
    await grayBox.click();

    const fileChooser = await fileChooserPromise;
    expect(fileChooser).toBeTruthy();
  });

  test("여러 이미지를 업로드하고 개별 삭제가 가능한지 확인", async ({ page }) => {
    // 테스트용 이미지 버퍼
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    // 첫 번째 이미지 업로드
    const firstImageInput = page.locator('input[id="fileInput_0"]');
    await firstImageInput.setInputFiles({
      name: "test-image-1.png",
      mimeType: "image/png",
      buffer,
    });

    // 두 번째 이미지 업로드
    const secondImageInput = page.locator('input[id="fileInput_1"]');
    await secondImageInput.setInputFiles({
      name: "test-image-2.png",
      mimeType: "image/png",
      buffer,
    });

    // 두 이미지 모두 표시되는지 확인
    const firstUploadedImage = page.locator('img[alt="업로드된 이미지 1"]');
    const secondUploadedImage = page.locator('img[alt="업로드된 이미지 2"]');
    await expect(firstUploadedImage).toBeVisible();
    await expect(secondUploadedImage).toBeVisible();

    // 첫 번째 이미지만 삭제
    const firstDeleteButton = page.locator('[data-testid="delete-image-btn-0"]');
    await firstDeleteButton.click();

    // 첫 번째 이미지는 제거되고, 두 번째 이미지는 유지되는지 확인
    await expect(firstUploadedImage).not.toBeVisible();
    await expect(secondUploadedImage).toBeVisible();
  });

  test("JPEG, PNG 확장자만 허용하는지 확인", async ({ page }) => {
    // 첫 번째 input의 accept 속성 확인
    const firstImageInput = page.locator('input[id="fileInput_0"]');
    const acceptAttr = await firstImageInput.getAttribute("accept");

    expect(acceptAttr).toBe("image/jpeg, image/png");
  });
});

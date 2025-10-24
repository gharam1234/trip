import { test, expect } from "@playwright/test";

test.describe("우편번호 및 주소 검색 기능", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태를 나타내기 위해 localStorage에 액세스 토큰 설정
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'test-token-for-e2e-testing');
      localStorage.setItem('user', JSON.stringify({
        _id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });

    // 게시물 작성 페이지로 이동
    await page.goto("/boards/new", { waitUntil: "domcontentloaded" });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="boards-write-page"]');
  });

  test("우편번호 검색 버튼이 렌더링되어야 함", async ({ page }) => {
    // 우편번호 검색 버튼 요소 확인
    const zipButton = page.locator('button:has-text("우편번호 검색")');
    await expect(zipButton).toBeVisible();
  });

  test("우편번호 검색 버튼 클릭 시 모달이 열려야 함", async ({ page }) => {
    // 우편번호 검색 버튼 클릭
    const zipButton = page.locator('button:has-text("우편번호 검색")');
    await expect(zipButton).toBeVisible();
    await zipButton.click();

    // 모달이 열렸는지 확인 - antd Modal 기반이므로 모달 제목 텍스트 확인
    // antd Modal의 제목은 .ant-modal-title 클래스를 가짐
    const modalTitle = page.locator(".ant-modal-title:has-text('우편번호 & 주소찾기')");
    await expect(modalTitle).toBeVisible();
  });

  test("모달 닫기 버튼으로 모달이 닫혀야 함", async ({ page }) => {
    // 우편번호 검색 버튼 클릭
    const zipButton = page.locator('button:has-text("우편번호 검색")');
    await expect(zipButton).toBeVisible();
    await zipButton.click();

    // 모달이 열렸는지 확인 - antd Modal의 제목
    const modalTitle = page.locator(".ant-modal-title:has-text('우편번호 & 주소찾기')");
    await expect(modalTitle).toBeVisible();

    // antd Modal의 닫기 버튼을 클릭 (우상단 X 버튼)
    // antd Modal의 닫기 버튼은 .ant-modal-close 클래스를 가짐
    const closeButton = page.locator('.ant-modal-close').first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // 모달이 닫혔는지 확인
    await expect(modalTitle).not.toBeVisible({ timeout: 5000 });
  });

  test("주소 입력 필드가 readOnly 상태여야 함", async ({ page }) => {
    // 주소 입력 필드 확인
    let addressInput = page.locator('input[placeholder="주소를 입력해 주세요,"]');
    let count = await addressInput.count();

    if (count === 0) {
      addressInput = page.locator('input[placeholder*="주소"]').first();
    }

    await expect(addressInput).toBeVisible();
    const isReadOnly = await addressInput.evaluate((el: HTMLInputElement) => el.readOnly);
    expect(isReadOnly).toBe(true);
  });

  test("우편번호 입력 필드가 disabled 상태여야 함", async ({ page }) => {
    // 우편번호 입력 필드 확인
    let zipcodeInput = page.locator('input[placeholder="01234"]');
    let count = await zipcodeInput.count();

    if (count === 0) {
      zipcodeInput = page.locator('input[placeholder*="01"]').first();
    }

    await expect(zipcodeInput).toBeVisible();
    const isDisabled = await zipcodeInput.evaluate((el: HTMLInputElement) => el.disabled);
    expect(isDisabled).toBe(true);
  });

  test("상세주소 입력 필드가 활성화되어 있어야 함", async ({ page }) => {
    // 상세주소 입력 필드 확인
    const detailInput = page.locator('input[placeholder="상세주소"]');
    await expect(detailInput).toBeVisible();
    const isDisabled = await detailInput.evaluate((el: HTMLInputElement) => el.disabled);
    expect(isDisabled).toBe(false);
  });

  test("모달에서 DaumPostcodeEmbed가 렌더링되어야 함", async ({ page }) => {
    // 우편번호 검색 버튼 클릭
    const zipButton = page.locator('button:has-text("우편번호 검색")');
    await expect(zipButton).toBeVisible();
    await zipButton.click();

    // 모달이 열렸는지 확인 - antd Modal의 제목
    const modalTitle = page.locator(".ant-modal-title:has-text('우편번호 & 주소찾기')");
    await expect(modalTitle).toBeVisible();

    // antd Modal 내부 콘텐츠 컨테이너 확인
    const modalContent = page.locator('.ant-modal-content');
    await expect(modalContent).toBeVisible();

    // DaumPostcodeEmbed 컴포넌트가 렌더링되면 스크립트가 로드되고
    // window.daum 객체가 생성됨
    const daumLoaded = await page.evaluate(async () => {
      // 최대 5초 동안 daum 객체가 생길 때까지 대기
      for (let i = 0; i < 50; i++) {
        if (typeof window.daum !== 'undefined' && window.daum !== null) {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return false;
    });

    // Daum 우편번호 서비스 스크립트가 로드되었는지 확인
    expect(daumLoaded).toBe(true);
  });
});

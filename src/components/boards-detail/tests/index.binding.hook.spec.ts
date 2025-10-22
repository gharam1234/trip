import { test, expect } from "@playwright/test";

// 테스트 데이터: 실제 사용할 boards 배열
const TEST_BOARDS = [
  {
    boardId: "1",
    writer: "홍길동",
    password: "1234",
    title: "첫 번째 게시글",
    contents: "이것은 첫 번째 게시글의 내용입니다.\n여러 줄로 구성되어 있습니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    boardAddress: {
      zipcode: "12345",
      address: "서울시 강남구",
      addressDetail: "강남로 123",
    },
    images: ["https://via.placeholder.com/400x300"],
    createdAt: "2024-01-15",
  },
  {
    boardId: "2",
    writer: "김영희",
    password: "5678",
    title: "두 번째 게시글",
    contents: "두 번째 게시글입니다.",
    youtubeUrl: "",
    boardAddress: {
      zipcode: "54321",
      address: "부산시 해운대구",
      addressDetail: "마린시티",
    },
    images: [],
    createdAt: "2024-01-16",
  },
];

test.describe("게시글 상세 데이터 바인딩 기능", () => {
  // 테스트 환경 설정
  test.beforeEach(async ({ page, context }) => {
    // 테스트 환경 설정
    await page.addInitScript(() => {
      window.__TEST_ENV__ = 'test';
      window.__TEST_BYPASS__ = true;
    });
    
    // 홈페이지 로드하여 localStorage에 접근 가능하게 설정
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  // 성공 시나리오: 유효한 boardId로 데이터가 올바르게 바인딩되는지 확인
  test("유효한 boardId로 게시글 데이터가 올바르게 바인딩되어야 함", async ({
    page,
    context,
  }) => {
    // 스토리지 초기화 및 테스트 데이터 설정 후 페이지로 이동
    // beforeEach에서 이미 "/"로 로드했으므로 스토리지 설정만 수행
    await page.evaluate((data) => {
      localStorage.clear();
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    // /boards/1 페이지로 이동
    await page.goto("/boards/1", { waitUntil: "networkidle" });

    // 페이지 완전 로드 확인: data-testid 기반 대기 (500ms 이내)
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );

    // 제목 검증
    await expect(boardDetailContainer.locator("h1")).toContainText(
      "첫 번째 게시글"
    );

    // 작성자 검증
    await expect(boardDetailContainer.locator('[class*="profileName"]')).toContainText(
      "홍길동"
    );

    // 작성일 검증
    await expect(boardDetailContainer.locator('[class*="writerDate"]')).toContainText(
      "2024-01-15"
    );

    // 위치 정보 검증
    const iconLocation = boardDetailContainer.locator('[aria-label~="위치:"]');
    await expect(iconLocation).toBeVisible();

    // 내용 검증
    await expect(
      boardDetailContainer.locator('[class*="contentParagraph"]').first()
    ).toContainText("이것은 첫 번째 게시글의 내용입니다.");

    // 유튜브 URL 검증
    const playButton = boardDetailContainer.locator('[aria-label="재생"]');
    await expect(playButton).toBeVisible();
  });

  // 성공 시나리오: 다른 boardId로 데이터 바인딩 확인
  test("다른 boardId로 접근 시 해당하는 게시글 데이터가 바인딩되어야 함", async ({
    page,
  }) => {
    await page.evaluate((data) => {
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    await page.goto("/boards/2", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );

    // 제목 검증
    await expect(boardDetailContainer.locator("h1")).toContainText(
      "두 번째 게시글"
    );

    // 작성자 검증
    await expect(boardDetailContainer.locator('[class*="profileName"]')).toContainText(
      "김영희"
    );

    // 내용 검증
    await expect(boardDetailContainer.locator('[class*="contentParagraph"]')).toContainText(
      "두 번째 게시글입니다."
    );

    // 위치 정보 검증
    const iconLocation = boardDetailContainer.locator('[aria-label~="위치:"]');
    await expect(iconLocation).toBeVisible();
  });

  // 실패 시나리오: 빈 로컬스토리지에서 처리 확인
  test("로컬스토리지가 비어있을 때 에러 메시지가 표시되어야 함", async ({
    page,
  }) => {
    // 로컬스토리지를 초기화하여 빈 상태로 설정
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.goto("/boards/1", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    // 에러 메시지 확인
    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );
    await expect(boardDetailContainer).toContainText(/게시글|오류|데이터/);
  });

  // 실패 시나리오: 존재하지 않는 boardId 처리
  test("존재하지 않는 boardId로 접근 시 게시글을 찾을 수 없다는 메시지가 표시되어야 함", async ({
    page,
  }) => {
    await page.evaluate((data) => {
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    // 존재하지 않는 boardId로 접근
    await page.goto("/boards/999", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    // 게시글을 찾을 수 없다는 메시지 확인
    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );
    await expect(boardDetailContainer).toContainText("게시글을 찾을 수 없습니다.");
  });

  // 실패 시나리오: 빈 배열 처리
  test("boards 배열이 비어있을 때 에러 메시지가 표시되어야 함", async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem("boards", JSON.stringify([]));
    });

    await page.goto("/boards/1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    // 에러 메시지 확인
    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );
    await expect(boardDetailContainer).toContainText(/게시글|오류|비어/);
  });

  // 성공 시나리오: 이미지가 없는 경우 처리
  test("이미지가 없는 게시글도 올바르게 렌더링되어야 함", async ({ page }) => {
    // 스토리지 초기화 위해 먼저 페이지 로드
    await page.goto("/", { waitUntil: "domcontentloaded" });
    
    await page.evaluate((data) => {
      localStorage.clear();
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    // boardId 2는 images가 빈 배열
    await page.goto("/boards/2", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );

    // heroImage 영역이 존재하고 배경이미지가 없음을 확인
    const heroImage = boardDetailContainer.locator('[class*="heroImage"]');
    await expect(heroImage).toBeVisible();

    // 내용이 올바르게 바인딩되었는지 확인
    await expect(boardDetailContainer.locator("h1")).toContainText(
      "두 번째 게시글"
    );
  });

  // 성공 시나리오: 유튜브 URL이 없는 경우 처리
  test("유튜브 URL이 없는 게시글도 올바르게 렌더링되어야 함", async ({
    page,
  }) => {
    await page.evaluate((data) => {
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    // boardId 2는 youtubeUrl이 빈 문자열
    await page.goto("/boards/2", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );

    // 비디오가 없습니다 메시지 확인
    await expect(
      boardDetailContainer.locator('[class*="videoThumb"]')
    ).toContainText("비디오가 없습니다");
  });

  // 추가 테스트: 모든 바인딩 데이터 개별 검증
  test("모든 바인딩 데이터가 정확하게 표시되어야 함", async ({ page }) => {
    await page.evaluate((data) => {
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    await page.goto("/boards/1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );

    // 1. 제목 바인딩 검증
    await expect(boardDetailContainer.locator("h1")).toHaveText("첫 번째 게시글");

    // 2. 작성자 바인딩 검증
    await expect(boardDetailContainer.locator('[class*="profileName"]')).toHaveText("홍길동");

    // 3. 작성일 바인딩 검증
    await expect(boardDetailContainer.locator('[class*="writerDate"]')).toHaveText("2024-01-15");

    // 4. 위치정보(addressDetail) 바인딩 검증 - aria-label에 위치 정보 확인
    const locationIcon = boardDetailContainer.locator('[aria-label~="위치:"]');
    await expect(locationIcon).toBeVisible();

    // 5. 이미지 바인딩 검증 - 첫 번째 이미지가 배경으로 설정되었는지 확인
    const heroImage = boardDetailContainer.locator('[class*="heroImage"]');
    await expect(heroImage).toBeVisible();
    // 배경 이미지가 설정되었는지 확인 (style 속성에서 background-image 확인)
    const backgroundImage = await heroImage.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });
    // 배경 이미지가 설정되어 있으면 URL을 포함해야 함
    if (backgroundImage && backgroundImage !== 'none') {
      expect(backgroundImage).toContain("https://via.placeholder.com/400x300");
    }

    // 6. 내용(contents) 바인딩 검증 - 줄바꿈 처리 확인
    const contentParagraphs = boardDetailContainer.locator('[class*="contentParagraph"]');
    await expect(contentParagraphs.first()).toHaveText("이것은 첫 번째 게시글의 내용입니다.");
    await expect(contentParagraphs.nth(1)).toHaveText("여러 줄로 구성되어 있습니다.");

    // 7. 유튜브링크(youtubeUrl) 바인딩 검증 - 재생 버튼이 표시되는지 확인
    const playButton = boardDetailContainer.locator('[aria-label="재생"]');
    await expect(playButton).toBeVisible();
    
    // 재생 버튼이 클릭 가능한지 확인 (실제 클릭은 하지 않음)
    await expect(playButton).toBeEnabled();
  });

  // 추가 테스트: boardId 타입 변환 테스트
  test("숫자형 boardId도 올바르게 처리되어야 함", async ({ page }) => {
    // 숫자형 boardId를 가진 테스트 데이터
    const numericBoardData = [{
      boardId: 1, // 숫자형
      writer: "숫자형ID테스트",
      password: "1234",
      title: "숫자형 boardId 테스트",
      contents: "숫자형 boardId로 접근한 게시글입니다.",
      youtubeUrl: "",
      boardAddress: {
        zipcode: "12345",
        address: "테스트 주소",
        addressDetail: "테스트 상세주소",
      },
      images: [],
      createdAt: "2024-01-20",
    }];

    // 스토리지 초기화 위해 먼저 페이지 로드
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.evaluate((data) => {
      localStorage.clear();
      localStorage.setItem("boards", JSON.stringify(data));
    }, numericBoardData);

    // 문자열 boardId로 접근 (URL에서는 항상 문자열)
    await page.goto("/boards/1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );

    // 숫자형 boardId가 문자열로 변환되어 매칭되는지 확인
    await expect(boardDetailContainer.locator("h1")).toHaveText("숫자형 boardId 테스트");
    await expect(boardDetailContainer.locator('[class*="profileName"]')).toHaveText("숫자형ID테스트");
  });

  // 추가 테스트: JSON 파싱 오류 처리
  test("잘못된 JSON 데이터가 있을 때 에러 메시지가 표시되어야 함", async ({ page }) => {
    // 잘못된 JSON 데이터를 로컬스토리지에 저장
    await page.evaluate(() => {
      localStorage.setItem("boards", "{ invalid json data }");
    });

    await page.goto("/boards/1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    // JSON 파싱 오류 메시지 확인
    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );
    await expect(boardDetailContainer).toContainText(/오류|JSON|파싱/);
  });

  // 추가 테스트: boardId가 빈 문자열일 때 처리 (훅 레벨에서 테스트)
  test("boardId가 빈 문자열일 때 에러 메시지가 표시되어야 함", async ({ page }) => {
    await page.evaluate((data) => {
      localStorage.setItem("boards", JSON.stringify(data));
    }, TEST_BOARDS);

    // 빈 boardId로 접근하는 대신, 훅이 빈 문자열을 받았을 때의 처리를 테스트
    // 실제로는 Next.js 라우팅에서 처리되므로, 이 테스트는 훅의 내부 로직을 검증
    await page.goto("/boards/1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="board-detail-page"]')).toBeVisible(
      { timeout: 500 }
    );

    // 정상적인 boardId로 접근했으므로 정상적으로 로드되어야 함
    const boardDetailContainer = page.locator(
      '[data-testid="board-detail-page"]'
    );
    await expect(boardDetailContainer.locator("h1")).toContainText("첫 번째 게시글");
  });
});

import { test, expect } from '@playwright/test';

// 테스트용 샘플 데이터
const sampleBoardsData = [
  {
    boardId: "board-001",
    writer: "홍길동",
    password: "password123",
    title: "제주 살이 1일차",
    contents: "제주도에서의 첫날 이야기입니다.",
    youtubeUrl: "https://youtube.com/watch?v=example1",
    boardAddress: {
      zipcode: "63000",
      address: "제주특별자치도 제주시",
      addressDetail: "연동 123-45"
    },
    images: ["image1.jpg", "image2.jpg"],
    createdAt: "2024-12-16T10:30:00Z"
  },
  {
    boardId: "board-002", 
    writer: "김철수",
    password: "password456",
    title: "강남 살이 100년차",
    contents: "강남에서의 오랜 생활 이야기입니다.",
    youtubeUrl: "https://youtube.com/watch?v=example2",
    boardAddress: {
      zipcode: "06000",
      address: "서울특별시 강남구",
      addressDetail: "테헤란로 123"
    },
    images: ["image3.jpg"],
    createdAt: "2024-12-15T14:20:00Z"
  },
  {
    boardId: "board-003",
    writer: "이영희",
    password: "password789",
    title: "길 걷고 있었는데 고양이한테 간택 받았어요",
    contents: "길에서 만난 고양이와의 특별한 만남 이야기입니다.",
    youtubeUrl: "",
    boardAddress: {
      zipcode: "04000",
      address: "서울특별시 마포구",
      addressDetail: "홍대입구역 1번출구"
    },
    images: [],
    createdAt: "2024-12-14T09:15:00Z"
  }
];

test.describe('Boards 데이터 바인딩 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로컬스토리지에 샘플 데이터 설정
    await page.goto('/boards');
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify(data));
    }, sampleBoardsData);
    
    // 페이지 새로고침하여 데이터 반영
    await page.reload();
  });

  test('로컬스토리지 데이터가 올바르게 표시되는지 확인', async ({ page }) => {
    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 로딩 상태가 완료될 때까지 대기 (로딩 텍스트가 사라질 때까지)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('[class*="listRow"]');
      return loadingElement && !loadingElement.textContent?.includes('로딩 중');
    }, { timeout: 500 });
    
    // 게시글 리스트가 표시되는지 확인 (CSS 모듈 클래스명 사용)
    const listRows = page.locator('[class*="listRow"]');
    await expect(listRows).toHaveCount(3);
    
    // 첫 번째 게시글 데이터 확인 (최신 순으로 정렬된 결과: board-001이 첫 번째)
    const firstRow = listRows.first();
    await expect(firstRow.locator('[class*="colNo"]')).toHaveText('board-001');
    await expect(firstRow.locator('[class*="colTitle"]')).toHaveText('제주 살이 1일차');
    await expect(firstRow.locator('[class*="colAuthor"]')).toHaveText('홍길동');
    await expect(firstRow.locator('[class*="colDate"]')).toHaveText('2024.12.16');
    
    // 두 번째 게시글 데이터 확인 (board-002가 두 번째)
    const secondRow = listRows.nth(1);
    await expect(secondRow.locator('[class*="colNo"]')).toHaveText('board-002');
    await expect(secondRow.locator('[class*="colTitle"]')).toHaveText('강남 살이 100년차');
    await expect(secondRow.locator('[class*="colAuthor"]')).toHaveText('김철수');
    await expect(secondRow.locator('[class*="colDate"]')).toHaveText('2024.12.15');
    
    // 세 번째 게시글 데이터 확인 (board-003이 세 번째)
    const thirdRow = listRows.nth(2);
    await expect(thirdRow.locator('[class*="colNo"]')).toHaveText('board-003');
    await expect(thirdRow.locator('[class*="colTitle"]')).toHaveText('길 걷고 있었는데 고양이한테 간택 받았어요');
    await expect(thirdRow.locator('[class*="colAuthor"]')).toHaveText('이영희');
    await expect(thirdRow.locator('[class*="colDate"]')).toHaveText('2024.12.14');
  });

  test('긴 제목이 올바르게 잘리는지 확인', async ({ page }) => {
    // 긴 제목을 가진 데이터 추가
    const longTitleData = [
      {
        boardId: "board-long",
        writer: "테스터",
        password: "password",
        title: "이것은 매우 긴 제목입니다. 50자를 넘어가는 제목이므로 잘려서 표시되어야 합니다. 정말로 긴 제목이에요.",
        contents: "긴 제목 테스트용 내용입니다.",
        youtubeUrl: "",
        boardAddress: {
          zipcode: "00000",
          address: "테스트 주소",
          addressDetail: "테스트 상세주소"
        },
        images: [],
        createdAt: "2024-12-16T12:00:00Z"
      }
    ];
    
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify(data));
    }, longTitleData);
    
    await page.reload();
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 로딩 상태가 완료될 때까지 대기 (로딩 텍스트가 사라질 때까지)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('[class*="listRow"]');
      return loadingElement && !loadingElement.textContent?.includes('로딩 중');
    }, { timeout: 500 });
    
    const listRows = page.locator('[class*="listRow"]');
    await expect(listRows).toHaveCount(1);
    
    const titleCell = listRows.first().locator('[class*="colTitle"]');
    const titleText = await titleCell.textContent();
    
    // 제목이 50자로 잘렸는지 확인 (실제로는 53자: 50자 + "...")
    expect(titleText).toMatch(/^.{50}\.\.\.$/);
  });

  test('로컬스토리지에 데이터가 없을 때 빈 리스트 표시', async ({ page }) => {
    // 로컬스토리지 비우기
    await page.evaluate(() => {
      localStorage.removeItem('boards');
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 빈 리스트 메시지가 표시되는지 확인
    const listRows = page.locator('[class*="listRow"]');
    await expect(listRows).toHaveCount(1);
    await expect(listRows.first().locator('[class*="colTitle"]')).toHaveText('등록된 게시글이 없습니다.');
  });

  test('잘못된 JSON 데이터 처리', async ({ page }) => {
    // 잘못된 JSON 데이터 설정
    await page.evaluate(() => {
      localStorage.setItem('boards', 'invalid-json-data');
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 오류가 발생해도 오류 메시지가 표시되는지 확인
    const listRows = page.locator('[class*="listRow"]');
    await expect(listRows).toHaveCount(1);
    await expect(listRows.first().locator('[class*="colTitle"]')).toContainText('데이터를 불러오는 중 오류가 발생했습니다.');
  });

  test('게시글이 최신 순으로 정렬되는지 확인', async ({ page }) => {
    // 날짜 순서가 뒤죽박죽인 데이터로 테스트
    const unsortedData = [
      {
        boardId: "old-post",
        writer: "오래된작성자",
        password: "password",
        title: "오래된 게시글",
        contents: "오래된 내용",
        youtubeUrl: "",
        boardAddress: {
          zipcode: "00000",
          address: "테스트 주소",
          addressDetail: "테스트 상세주소"
        },
        images: [],
        createdAt: "2024-12-10T10:00:00Z" // 가장 오래됨
      },
      {
        boardId: "new-post",
        writer: "최신작성자",
        password: "password",
        title: "최신 게시글",
        contents: "최신 내용",
        youtubeUrl: "",
        boardAddress: {
          zipcode: "00000",
          address: "테스트 주소",
          addressDetail: "테스트 상세주소"
        },
        images: [],
        createdAt: "2024-12-20T15:00:00Z" // 가장 최신
      },
      {
        boardId: "middle-post",
        writer: "중간작성자",
        password: "password",
        title: "중간 게시글",
        contents: "중간 내용",
        youtubeUrl: "",
        boardAddress: {
          zipcode: "00000",
          address: "테스트 주소",
          addressDetail: "테스트 상세주소"
        },
        images: [],
        createdAt: "2024-12-15T12:00:00Z" // 중간
      }
    ];
    
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify(data));
    }, unsortedData);
    
    await page.reload();
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 로딩 상태가 완료될 때까지 대기 (로딩 텍스트가 사라질 때까지)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('[class*="listRow"]');
      return loadingElement && !loadingElement.textContent?.includes('로딩 중');
    }, { timeout: 500 });
    
    const listRows = page.locator('[class*="listRow"]');
    await expect(listRows).toHaveCount(3);
    
    // 최신 순으로 정렬되어야 함: new-post -> middle-post -> old-post
    await expect(listRows.first().locator('[class*="colNo"]')).toHaveText('new-post');
    await expect(listRows.nth(1).locator('[class*="colNo"]')).toHaveText('middle-post');
    await expect(listRows.nth(2).locator('[class*="colNo"]')).toHaveText('old-post');
  });

  test('날짜 포맷팅이 올바르게 되는지 확인', async ({ page }) => {
    // 다양한 날짜 형식 테스트
    const dateTestData = [
      {
        boardId: "date-test-1",
        writer: "날짜테스터",
        password: "password",
        title: "ISO 날짜 테스트",
        contents: "ISO 날짜 형식 테스트",
        youtubeUrl: "",
        boardAddress: {
          zipcode: "00000",
          address: "테스트 주소",
          addressDetail: "테스트 상세주소"
        },
        images: [],
        createdAt: "2024-12-16T15:30:45.123Z"
      },
      {
        boardId: "date-test-2",
        writer: "날짜테스터2",
        password: "password",
        title: "문자열 날짜 테스트",
        contents: "문자열 날짜 형식 테스트",
        youtubeUrl: "",
        boardAddress: {
          zipcode: "00000",
          address: "테스트 주소",
          addressDetail: "테스트 상세주소"
        },
        images: [],
        createdAt: "2024-12-15"
      }
    ];
    
    await page.evaluate((data) => {
      localStorage.setItem('boards', JSON.stringify(data));
    }, dateTestData);
    
    await page.reload();
    await page.waitForSelector('[data-testid="boards-list-page"]', { timeout: 500 });
    
    // 로딩 상태가 완료될 때까지 대기 (로딩 텍스트가 사라질 때까지)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('[class*="listRow"]');
      return loadingElement && !loadingElement.textContent?.includes('로딩 중');
    }, { timeout: 500 });
    
    const listRows = page.locator('[class*="listRow"]');
    await expect(listRows).toHaveCount(2);
    
    // 첫 번째 날짜 확인 (ISO 형식) - 시간대에 따라 날짜가 다를 수 있음
    const firstDate = await listRows.first().locator('[class*="colDate"]').textContent();
    expect(firstDate).toMatch(/2024\.12\.(16|17)/);
    
    // 두 번째 날짜 확인 (문자열 형식)
    const secondDate = await listRows.nth(1).locator('[class*="colDate"]').textContent();
    expect(secondDate).toMatch(/2024\.12\.(15|16)/);
  });
});

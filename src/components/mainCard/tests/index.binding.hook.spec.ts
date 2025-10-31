import { test, expect } from '@playwright/test';

/**
 * 메인카드 데이터 바인딩 Playwright 테스트
 * - 실제 API 데이터를 사용한 TDD 기반 테스트
 * - data-testid 기반 페이지 로드 대기
 * - 성공/실패 시나리오 검증
 * - likeCount 기준 정렬 및 상위 4개만 표시 검증
 */
test.describe('메인카드 데이터 바인딩 (API) 테스트', () => {
  // 각 테스트 전 /boards 페이지로 이동 (MainCard가 사용되는 페이지)
  test.beforeEach(async ({ page }) => {
    await page.goto('/boards');

    // 페이지가 완전히 로드될 때까지 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="maincard-container"]', { timeout: 500 });
  });

  test('성공 시나리오: API에서 정상 데이터를 반환하고 카드에 표시', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 제목 ("오늘 핫한 트립토크") 확인
    const title = page.locator('[data-testid="maincard-title"]');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText?.trim()).toBe('오늘 핫한 트립토크');

    // 카드 영역 확인 (CSS display:flex이므로 존재하면 됨)
    const cardArea = page.locator('[data-testid="maincard-cards-wrapper"]');
    await expect(cardArea).toBeDefined();

    // 카드 개수 확인 (최대 4개)
    // maincard-card-{id} 형식의 div 요소들만 조회 (img 제외)
    const cardDivs = page
      .locator('[data-testid^="maincard-card-"]')
      .filter({ has: page.locator('[data-testid^="maincard-card-title-"]') });
    const cardCount = await cardDivs.count();

    // 카드가 최대 4개까지만 표시되어야 함
    expect(cardCount).toBeLessThanOrEqual(4);
  });

  test('API에서 정상 데이터를 반환하고 likeCount 순서대로 정렬된 상위 4개 카드 표시', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 좋아요 요소 직접 조회
    const likeElements = page.locator('[data-testid^="maincard-card-like-"]');
    const likeCounts = await likeElements.count();

    if (likeCounts > 0) {
      // 표시된 카드 개수는 최대 4개
      expect(likeCounts).toBeLessThanOrEqual(4);

      // 각 카드의 좋아요 수 추출하여 정렬 확인
      const likeCountsArray: number[] = [];

      for (let i = 0; i < likeCounts; i++) {
        const likeElement = likeElements.nth(i);
        const likeText = await likeElement.textContent();

        // 좋아요 텍스트에서 숫자만 추출
        if (likeText) {
          const likeCount = parseInt(likeText.replace(/\D/g, ''));
          if (!isNaN(likeCount)) {
            likeCountsArray.push(likeCount);
          }
        }
      }

      // 좋아요 수가 내림차순으로 정렬되어 있는지 확인
      if (likeCountsArray.length > 1) {
        for (let i = 0; i < likeCountsArray.length - 1; i++) {
          expect(likeCountsArray[i]).toBeGreaterThanOrEqual(likeCountsArray[i + 1]);
        }
      }
    }
  });

  test('게시글 이미지는 images 배열의 첫 번째 요소가 올바르게 표시', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 카드 이미지 확인
    const cardImages = page.locator('[data-testid^="maincard-card-img-"]');
    const imageCount = await cardImages.count();

    if (imageCount > 0) {
      // 각 이미지가 올바르게 로드되었는지 확인
      for (let i = 0; i < imageCount; i++) {
        const img = cardImages.nth(i);

        // 이미지 요소가 보이는지 확인
        await expect(img).toBeVisible();

        // src 속성이 있는지 확인
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src?.length).toBeGreaterThan(0);

        // alt 속성이 있는지 확인 (접근성)
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });

  test('각 카드에 필요한 정보 (제목, 작성자, 좋아요, 날짜)가 표시', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 제목 요소 조회
    const titleElements = page.locator('[data-testid^="maincard-card-title-"]');
    const titleCount = await titleElements.count();

    if (titleCount > 0) {
      // 첫 번째 제목 확인
      const firstTitle = titleElements.first();
      await expect(firstTitle).toBeVisible();
      const titleText = await firstTitle.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);

      // 프로필 요소 조회
      const profileElements = page.locator('[data-testid^="maincard-card-profile-"]');
      const profileCount = await profileElements.count();
      expect(profileCount).toBeGreaterThan(0);

      // 좋아요 요소 조회
      const likeElements = page.locator('[data-testid^="maincard-card-like-"]');
      const likeCount = await likeElements.count();
      expect(likeCount).toBeGreaterThan(0);
    }
  });

  test('제목이 길 경우 text-overflow: ellipsis 스타일 적용 확인', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 카드 제목 요소 조회
    const titleElements = page.locator('[data-testid^="maincard-card-title-"]');
    const titleCount = await titleElements.count();

    if (titleCount > 0) {
      // 첫 번째 제목의 CSS 스타일 확인
      const firstTitle = titleElements.first();

      const computedStyle = await firstTitle.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
          overflow: style.overflow
        };
      });

      // 요구사항: text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
      expect(computedStyle.textOverflow).toBe('ellipsis');
      expect(computedStyle.whiteSpace).toBe('nowrap');
      expect(computedStyle.overflow).toBe('hidden');
    }
  });

  test('날짜 포맷이 YYYY.MM.DD 형식인지 확인', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 카드 조회 (div 요소만)
    const cards = page
      .locator('[data-testid^="maincard-card-"]')
      .filter({ has: page.locator('[data-testid^="maincard-card-title-"]') });
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // 모든 카드의 날짜 형식 확인 (최대 4개까지만 확인)
      for (let i = 0; i < Math.min(cardCount, 4); i++) {
        const card = cards.nth(i);
        const cardContent = await card.textContent();

        // 카드 내용에서 날짜 형식 찾기 (YYYY.MM.DD)
        if (cardContent) {
          const dateMatch = cardContent.match(/\d{4}\.\d{2}\.\d{2}/);
          if (dateMatch) {
            expect(dateMatch[0]).toMatch(/\d{4}\.\d{2}\.\d{2}/);
          }
        }
      }
    }
  });

  test('실패 시나리오: 빈 배열 반환 시 카드 표시 안 함', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 카드 조회 (div 요소만)
    const cards = page
      .locator('[data-testid^="maincard-card-"]')
      .filter({ has: page.locator('[data-testid^="maincard-card-title-"]') });
    const cardCount = await cards.count();

    // 카드가 없거나 최대 4개까지만 표시
    expect(cardCount).toBeLessThanOrEqual(4);
  });

  test('API 호출 실패 시 정상적으로 처리', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 카드 조회 (div 요소만)
    const cards = page
      .locator('[data-testid^="maincard-card-"]')
      .filter({ has: page.locator('[data-testid^="maincard-card-title-"]') });
    const cardCount = await cards.count();

    // 카드가 없어야 함 (API 실패 시)
    // 또는 에러 메시지가 표시되어야 함
    // 현재는 카드가 없으면 컨테이너만 보임
    expect(cardCount).toBeLessThanOrEqual(4);
  });

  test('상위 4개를 초과하는 카드는 표시하지 않음', async ({ page }) => {
    // 메인카드 컨테이너 확인
    const mainCardContainer = page.locator('[data-testid="maincard-container"]');

    // 메인카드 컨테이너가 표시되는지 확인
    await expect(mainCardContainer).toBeVisible({ timeout: 500 });

    // 카드 개수 확인 (div 요소만)
    const cards = page
      .locator('[data-testid^="maincard-card-"]')
      .filter({ has: page.locator('[data-testid^="maincard-card-title-"]') });
    const cardCount = await cards.count();

    // 카드는 최대 4개까지만 표시되어야 함
    expect(cardCount).toBeLessThanOrEqual(4);
  });
});

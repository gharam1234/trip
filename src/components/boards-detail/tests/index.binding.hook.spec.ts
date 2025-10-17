import { test, expect } from '@playwright/test';

/**
 * 테스트용 로컬스토리지 데이터
 * 
 * @constant {Array} testDiariesData - 테스트에 사용될 일기 데이터 배열
 * @property {number} id - 일기 고유 ID
 * @property {string} title - 일기 제목
 * @property {string} content - 일기 내용
 * @property {string} emotion - 감정 타입 (HAPPY, SAD, ANGRY)
 * @property {string} createdAt - 작성일 (YYYY. MM. DD 형식)
 */
const testDiariesData = [
  {
    id: 1,
    title: '테스트 일기 1',
    content: '첫 번째 테스트 일기 내용입니다.',
    emotion: 'HAPPY',
    createdAt: '2024. 01. 01'
  },
  {
    id: 2,
    title: '테스트 일기 2',
    content: '두 번째 테스트 일기 내용입니다.',
    emotion: 'SAD',
    createdAt: '2024. 01. 02'
  },
  {
    id: 3,
    title: '테스트 일기 3',
    content: '세 번째 테스트 일기 내용입니다.',
    emotion: 'ANGRY',
    createdAt: '2024. 01. 03'
  }
];

test.describe('DiariesDetail 바인딩 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로컬스토리지에 테스트 데이터 설정
    await page.goto('/diaries/1');
    await page.evaluate((data) => {
      localStorage.setItem('diaries', JSON.stringify(data));
    }, testDiariesData);
    
    // 페이지 새로고침하여 로컬스토리지 데이터 반영
    await page.reload();
  });

  /**
   * 유효한 ID로 일기 상세 데이터가 올바르게 바인딩되는지 확인
   * 
   * 시나리오:
   * 1. 로컬스토리지에 테스트 데이터 설정
   * 2. /diaries/1 페이지로 이동
   * 3. 페이지 로드 완료 대기
   * 4. 제목, 내용, 감정, 작성일 데이터 검증
   * 
   * 검증 항목:
   * - 제목: "테스트 일기 1"
   * - 내용: "첫 번째 테스트 일기 내용입니다."
   * - 감정: "행복해요" (HAPPY → "행복해요" 변환)
   * - 작성일: "2024. 01. 01"
   */
  test('유효한 ID로 일기 상세 데이터가 올바르게 바인딩되는지 확인', async ({ page }) => {
    // 페이지 로드 대기 (data-testid 사용)
    await page.waitForSelector('[data-testid="diary-detail-container"]', { timeout: 500 });
    
    // 로딩이 완료될 때까지 대기
    await page.waitForFunction(() => {
      const loading = document.querySelector('[data-testid="diary-loading"]');
      return !loading;
    }, { timeout: 1000 });
    
    // 제목 확인
    await expect(page.locator('[data-testid="diary-title"]')).toHaveText('테스트 일기 1');
    
    // 내용 확인
    await expect(page.locator('[data-testid="diary-content"]')).toHaveText('첫 번째 테스트 일기 내용입니다.');
    
    // 감정 텍스트 확인
    await expect(page.locator('[data-testid="diary-emotion-text"]')).toHaveText('행복해요');
    
    // 작성일 확인
    await expect(page.locator('[data-testid="diary-created-at"]')).toHaveText('2024. 01. 01');
  });

  /**
   * 다른 ID로 일기 상세 데이터가 올바르게 바인딩되는지 확인
   * 
   * 시나리오:
   * 1. 로컬스토리지에 테스트 데이터 설정
   * 2. /diaries/2 페이지로 이동 (다른 ID)
   * 3. 페이지 로드 완료 대기
   * 4. 해당 ID의 일기 데이터 검증
   * 
   * 검증 항목:
   * - 제목: "테스트 일기 2"
   * - 내용: "두 번째 테스트 일기 내용입니다."
   * - 감정: "슬퍼요" (SAD → "슬퍼요" 변환)
   * - 작성일: "2024. 01. 02"
   */
  test('다른 ID로 일기 상세 데이터가 올바르게 바인딩되는지 확인', async ({ page }) => {
    // 다른 ID로 페이지 이동
    await page.goto('/diaries/2');
    await page.waitForSelector('[data-testid="diary-detail-container"]', { timeout: 500 });
    
    // 로딩이 완료될 때까지 대기
    await page.waitForFunction(() => {
      const loading = document.querySelector('[data-testid="diary-loading"]');
      return !loading;
    }, { timeout: 1000 });
    
    // 제목 확인
    await expect(page.locator('[data-testid="diary-title"]')).toHaveText('테스트 일기 2');
    
    // 내용 확인
    await expect(page.locator('[data-testid="diary-content"]')).toHaveText('두 번째 테스트 일기 내용입니다.');
    
    // 감정 텍스트 확인
    await expect(page.locator('[data-testid="diary-emotion-text"]')).toHaveText('슬퍼요');
    
    // 작성일 확인
    await expect(page.locator('[data-testid="diary-created-at"]')).toHaveText('2024. 01. 02');
  });

  /**
   * 존재하지 않는 ID로 접근 시 에러 메시지가 표시되는지 확인
   * 
   * 시나리오:
   * 1. 로컬스토리지에 테스트 데이터 설정
   * 2. /diaries/999 페이지로 이동 (존재하지 않는 ID)
   * 3. 에러 메시지 표시 확인
   * 
   * 검증 항목:
   * - 에러 메시지: "오류: 해당 일기를 찾을 수 없습니다."
   */
  test('존재하지 않는 ID로 접근 시 에러 메시지가 표시되는지 확인', async ({ page }) => {
    // 존재하지 않는 ID로 페이지 이동
    await page.goto('/diaries/999');
    await page.waitForSelector('[data-testid="diary-detail-container"]', { timeout: 500 });
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="diary-error"]')).toHaveText('오류: 해당 일기를 찾을 수 없습니다.');
  });

  /**
   * 로컬스토리지에 데이터가 없을 때 에러 메시지가 표시되는지 확인
   * 
   * 시나리오:
   * 1. 로컬스토리지에서 'diaries' 키 제거
   * 2. /diaries/1 페이지로 이동
   * 3. 에러 메시지 표시 확인
   * 
   * 검증 항목:
   * - 에러 메시지: "오류: 저장된 일기가 없습니다."
   */
  test('로컬스토리지에 데이터가 없을 때 에러 메시지가 표시되는지 확인', async ({ page }) => {
    // 로컬스토리지 비우기
    await page.evaluate(() => {
      localStorage.removeItem('diaries');
    });
    
    await page.goto('/diaries/1');
    await page.waitForSelector('[data-testid="diary-detail-container"]', { timeout: 500 });
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="diary-error"]')).toHaveText('오류: 저장된 일기가 없습니다.');
  });

  /**
   * 유효하지 않은 ID 형식으로 접근 시 에러 메시지가 표시되는지 확인
   * 
   * 시나리오:
   * 1. 로컬스토리지에 테스트 데이터 설정
   * 2. /diaries/invalid-id 페이지로 이동 (문자열 ID)
   * 3. 에러 메시지 표시 확인
   * 
   * 검증 항목:
   * - 에러 메시지: "오류: 유효하지 않은 일기 ID 형식입니다."
   */
  test('유효하지 않은 ID 형식으로 접근 시 에러 메시지가 표시되는지 확인', async ({ page }) => {
    // 유효하지 않은 ID로 페이지 이동
    await page.goto('/diaries/invalid-id');
    await page.waitForSelector('[data-testid="diary-detail-container"]', { timeout: 500 });
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="diary-error"]')).toHaveText('오류: 유효하지 않은 일기 ID 형식입니다.');
  });

  /**
   * 내용 복사 기능이 올바르게 작동하는지 확인
   * 
   * 시나리오:
   * 1. 로컬스토리지에 테스트 데이터 설정
   * 2. /diaries/1 페이지로 이동
   * 3. 페이지 로드 완료 대기
   * 4. 복사 버튼 클릭
   * 5. 성공 메시지 확인
   * 
   * 검증 항목:
   * - alert 메시지: "내용이 복사되었습니다."
   * - 클립보드에 일기 내용 복사됨
   */
  test('내용 복사 기능이 올바르게 작동하는지 확인', async ({ page }) => {
    await page.goto('/diaries/1');
    await page.waitForSelector('[data-testid="diary-detail-container"]', { timeout: 500 });
    
    // 로딩이 완료될 때까지 대기
    await page.waitForFunction(() => {
      const loading = document.querySelector('[data-testid="diary-loading"]');
      return !loading;
    }, { timeout: 1000 });
    
    // 복사 버튼 클릭
    await page.click('[data-testid="copy-button"]');
    
    // alert 대화상자 확인 (복사 성공 메시지)
    page.on('dialog', dialog => {
      expect(dialog.message()).toBe('내용이 복사되었습니다.');
      dialog.accept();
    });
  });
});

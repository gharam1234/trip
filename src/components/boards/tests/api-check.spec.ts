import { test } from '@playwright/test';

test('API 확인: fetchBoards 데이터 조회', async ({ page }) => {
  // GraphQL API 요청 감지
  let apiCalled = false;
  let apiResponse: any = null;

  page.on('response', async (response) => {
    if (response.url().includes('graphql') && response.request().method() === 'POST') {
      const body = response.request().postDataJSON();
      if (body && body.operationName === 'FetchBoards') {
        apiCalled = true;
        try {
          apiResponse = await response.json();
          console.log('API 응답:', JSON.stringify(apiResponse, null, 2));
        } catch (e) {
          console.log('API 응답 파싱 실패:', e);
        }
      }
    }
  });

  await page.goto('/boards');
  await page.waitForSelector('[data-testid="boards-container"]', { timeout: 5000 });

  // API 호출 대기
  await page.waitForTimeout(2000);

  console.log('API 호출 여부:', apiCalled);
  console.log('API 응답:', apiResponse);
});

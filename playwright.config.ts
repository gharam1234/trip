import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 공통 테스트 설정
  use: {
    // 기본 URL (개발 서버)
    baseURL: `http://localhost:${3000 + Number(process.env.AGENT_INDEX || '0')}`,
  },

  // 브라우저 프로젝트 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 개발 서버 설정 (테스트 실행 시 자동으로 Next.js 서버 시작)
  webServer: {
    command: `PORT=${3000 + Number(process.env.AGENT_INDEX || '0')} npm run dev`,
    url: `http://localhost:${3000 + Number(process.env.AGENT_INDEX || '0')}`,
    reuseExistingServer: !process.env.CI,
    env:{
      NEXT_PUBLIC_TEST_ENV:'test',
    }
  },
});
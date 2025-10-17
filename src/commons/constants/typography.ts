// 타이포그래피 토큰 정의
// 주의: 모든 주석은 한국어로 작성합니다.
// 피그마 디자인 시스템 기반 타이포그래피

// 폰트 패밀리: 피그마 디자인 시스템에 맞춰 구성
export const FONT_FAMILY = {
  // 국문 폰트 패밀리 (Pretendard)
  ko: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', Arial, Helvetica, sans-serif",
  // 영문/숫자 폰트 패밀리 (SUIT Variable)
  en: "'SUIT Variable', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Arial, Helvetica, sans-serif",
} as const;

// 반응형 기준치: 프로젝트 공통 브레이크포인트
export const BREAKPOINT = {
  // 모바일 최대 폭(px)
  mobileMax: 767,
  // 데스크톱 최소 폭(px)
  desktopMin: 768,
} as const;

// 개별 텍스트 스타일의 속성 타입
export type TextStyle = {
  fontSize: string; // 예: '16px'
  lineHeight: string; // 예: '24px' 또는 '1.5'
  fontWeight: number; // 예: 400, 500, 700
  letterSpacing?: string; // 예: '-0.02em'
};

// 타이포그래피 스케일: 피그마 디자인 시스템 기반
// 웹/모바일 구분 없이 통합 스타일로 구성
const TYPOGRAPHY_STYLES: Record<string, TextStyle> = {
  // 웹 헤드라인 계열 (Pretendard SemiBold)
  webHeadline01: { fontSize: '48px', lineHeight: '60px', fontWeight: 600 },
  webHeadline02: { fontSize: '36px', lineHeight: '48px', fontWeight: 600 },
  webHeadline03: { fontSize: '28px', lineHeight: '36px', fontWeight: 600 },

  // 헤드라인 계열 (Pretendard Bold/ExtraBold)
  headline01: { fontSize: '24px', lineHeight: '32px', fontWeight: 700 },
  headline02: { fontSize: '22px', lineHeight: '30px', fontWeight: 800 },
  headline03: { fontSize: '20px', lineHeight: '28px', fontWeight: 700 },

  // 타이틀 계열 (Pretendard Bold)
  title01: { fontSize: '18px', lineHeight: '24px', fontWeight: 700 },
  title02: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 }, // 피그마 디자인에 맞춰 lineHeight 수정
  title03: { fontSize: '14px', lineHeight: '20px', fontWeight: 200 },

  // 서브 타이틀 계열 (Pretendard SemiBold)
  subtitle01: { fontSize: '14px', lineHeight: '22px', fontWeight: 600 },
  subtitle02: { fontSize: '12px', lineHeight: '18px', fontWeight: 600 },

  // 버튼 텍스트 계열 (피그마 디자인 기반)
  button_large: { fontSize: '18px', lineHeight: '24px', fontWeight: 600 }, // "검색", "트립토크 등록" 등
  button_medium: { fontSize: '16px', lineHeight: '24px', fontWeight: 500 }, // "트립토크", "숙박권 구매" 등
  button_small: { fontSize: '14px', lineHeight: '20px', fontWeight: 600 }, // "로그인" 등

  // 본문 계열 (Pretendard Medium/Regular)
  body01: { fontSize: '16px', lineHeight: '24px', fontWeight: 500 },
  body02_m: { fontSize: '14px', lineHeight: '22px', fontWeight: 500 },
  body03: { fontSize: '12px', lineHeight: '18px', fontWeight: 500 },
  body01_regular: { fontSize: '16px', lineHeight: '22px', fontWeight: 400 },
  body02_s: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
  body03_regular: { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },

  // 라이트 텍스트 계열 (피그마 디자인 기반)
  light01: { fontSize: '16px', lineHeight: '20px', fontWeight: 300 }, // "홍길동" 등
  light02: { fontSize: '14px', lineHeight: '20px', fontWeight: 300 }, // "243", "2024.12.16" 등
  light03: { fontSize: '12px', lineHeight: '16px', fontWeight: 300 },

  // 캡션 계열 (Pretendard SemiBold/Medium)
  caption01: { fontSize: '12px', lineHeight: '14px', fontWeight: 600 },
  caption02_m: { fontSize: '10px', lineHeight: '12px', fontWeight: 600 },
  caption02_s: { fontSize: '10px', lineHeight: '12px', fontWeight: 500 },
  caption03: { fontSize: '8px', lineHeight: '10px', fontWeight: 600 },
};

// 반응형 타이포그래피: 모바일에서 크기 조정
const MOBILE_TYPOGRAPHY_STYLES: Record<string, TextStyle> = {
  // 웹 헤드라인 계열 (모바일에서 크기 축소)
  webHeadline01: { fontSize: '36px', lineHeight: '48px', fontWeight: 600 },
  webHeadline02: { fontSize: '28px', lineHeight: '36px', fontWeight: 600 },
  webHeadline03: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },

  // 헤드라인 계열
  headline01: { fontSize: '20px', lineHeight: '28px', fontWeight: 700 },
  headline02: { fontSize: '18px', lineHeight: '26px', fontWeight: 800 },
  headline03: { fontSize: '16px', lineHeight: '24px', fontWeight: 700 },

  // 타이틀 계열
  title01: { fontSize: '16px', lineHeight: '22px', fontWeight: 700 },
  title02: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 }, // 피그마 디자인에 맞춰 lineHeight 수정
  title03: { fontSize: '12px', lineHeight: '18px', fontWeight: 200 },
  // 폰트웨이트 조정 -> 글로벌cssd에서 해야함

  // 서브 타이틀 계열
  subtitle01: { fontSize: '12px', lineHeight: '18px', fontWeight: 600 },
  subtitle02: { fontSize: '10px', lineHeight: '16px', fontWeight: 600 },

  // 버튼 텍스트 계열 (모바일)
  button_large: { fontSize: '16px', lineHeight: '22px', fontWeight: 600 },
  button_medium: { fontSize: '14px', lineHeight: '20px', fontWeight: 500 },
  button_small: { fontSize: '12px', lineHeight: '18px', fontWeight: 600 },

  // 본문 계열
  body01: { fontSize: '14px', lineHeight: '22px', fontWeight: 500 },
  body02_m: { fontSize: '12px', lineHeight: '18px', fontWeight: 500 },
  body03: { fontSize: '10px', lineHeight: '16px', fontWeight: 500 },
  body01_regular: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
  body02_s: { fontSize: '12px', lineHeight: '18px', fontWeight: 400 },
  body03_regular: { fontSize: '10px', lineHeight: '14px', fontWeight: 400 },

  // 라이트 텍스트 계열 (모바일)
  light01: { fontSize: '14px', lineHeight: '18px', fontWeight: 300 },
  light02: { fontSize: '12px', lineHeight: '18px', fontWeight: 300 },
  light03: { fontSize: '10px', lineHeight: '14px', fontWeight: 300 },

  // 캡션 계열
  caption01: { fontSize: '10px', lineHeight: '12px', fontWeight: 600 },
  caption02_m: { fontSize: '8px', lineHeight: '10px', fontWeight: 600 },
  caption02_s: { fontSize: '8px', lineHeight: '10px', fontWeight: 500 },
  caption03: { fontSize: '6px', lineHeight: '8px', fontWeight: 600 },
};

// 언어별 폰트 패밀리 매핑: 추후 영문 전용 스타일을 쉽게 분기하기 위함
export const LANGUAGE_FONT = {
  ko: FONT_FAMILY.ko,
  en: FONT_FAMILY.en,
} as const;

export type LanguageKey = keyof typeof LANGUAGE_FONT; // 'ko' | 'en'

// 최상위 타이포그래피 토큰: 피그마 디자인 시스템 기반
export const TYPOGRAPHY = {
  // 데스크톱 스타일
  desktop: TYPOGRAPHY_STYLES,
  // 모바일 스타일 (반응형 크기 조정)
  mobile: MOBILE_TYPOGRAPHY_STYLES,
} as const;

export type TypographyToken = typeof TYPOGRAPHY;

// 유틸리티: CSS 변수 이름 생성기 (예: --typo-desktop-body01-fontSize)
export function buildCssVarName(scope: 'desktop' | 'mobile', key: string, prop: keyof TextStyle): string {
  return `--typo-${scope}-${key}-${prop}`;
}

// 유틸리티: 주어진 스타일 셋을 CSS 변수 레코드로 변환
export function toCssVariables(scope: 'desktop' | 'mobile', set: Record<string, TextStyle>): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(set).forEach(([key, style]) => {
    result[buildCssVarName(scope, key, 'fontSize')] = style.fontSize;
    result[buildCssVarName(scope, key, 'lineHeight')] = style.lineHeight;
    result[buildCssVarName(scope, key, 'fontWeight')] = String(style.fontWeight);
    if (style.letterSpacing) {
      result[buildCssVarName(scope, key, 'letterSpacing')] = style.letterSpacing;
    }
  });
  return result;
}

// 유틸리티: 특정 타이포그래피 스타일 가져오기
export function getTypographyStyle(scope: 'desktop' | 'mobile', key: keyof typeof TYPOGRAPHY_STYLES): TextStyle {
  return TYPOGRAPHY[scope][key];
}

// 유틸리티: 폰트 패밀리 가져오기 (언어별)
export function getFontFamily(language: LanguageKey): string {
  return FONT_FAMILY[language];
}



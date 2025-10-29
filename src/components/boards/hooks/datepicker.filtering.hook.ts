import React from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

/**
 * DatePicker 필터링 기능 Hook
 * - 날짜 범위 선택 상태 관리
 * - 날짜 변경 시 자동 검색 실행
 * - GraphQL API에 ISO8601(+타임존) 형식으로 날짜 파라미터 전달
 */

interface DateRangeState {
  start: string | null;
  end: string | null;
}

interface UseDatepickerFilteringReturn {
  dateRangeText: DateRangeState;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  handleDateRangeChange: (values: [Dayjs | null, Dayjs | null] | null) => void;
  resetDateRange: () => void;
}

export function useDatepickerFiltering(): UseDatepickerFilteringReturn {
  // 상태: 포맷된 날짜 문자열 (API 파라미터 연동)
  const [dateRangeText, setDateRangeText] = React.useState<DateRangeState>({
    start: null,
    end: null,
  });

  // 상태: 검색 실행 여부
  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = React.useCallback(
    (values: [Dayjs | null, Dayjs | null] | null) => {
      if (values && values[0] && values[1]) {
        const startText = dayjs(values[0]).startOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
        const endText = dayjs(values[1]).endOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
        setDateRangeText({ start: startText, end: endText });
        // 날짜 범위가 설정되면 자동으로 검색 상태 활성화
        setIsSearching(true);
      } else {
        setDateRangeText({ start: null, end: null });
        setIsSearching(false);
      }
    },
    []
  );

  // 날짜 범위 초기화
  const resetDateRange = React.useCallback(() => {
    setDateRangeText({ start: null, end: null });
  }, []);

  return {
    dateRangeText,
    isSearching,
    setIsSearching,
    handleDateRangeChange,
    resetDateRange,
  };
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


import React from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

/**
 * DatePicker 필터링 기능 Hook
 * - 날짜 범위 선택 상태 관리
 * - 날짜 변경 시 자동 검색 실행
 * - GraphQL API에 YYYY-MM-DD 형식의 날짜 파라미터 전달
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
        const startText = dayjs(values[0]).format("YYYY-MM-DD");
        // endDate에 시간 정보 추가: 23:59:59
        // 예: 사용자가 2025-10-27 ~ 2025-10-27 선택 → API로 2025-10-27 ~ 2025-10-27T23:59:59 전송
        // 백엔드: createdAt >= startDate AND createdAt <= endDate
        // 결과: 2025-10-27의 모든 데이터 포함 (시간까지 포함된 범위)
        const endText = dayjs(values[1]).format("YYYY-MM-DD[T23:59:59]");
        setDateRangeText({ start: startText, end: endText });
        // 날짜 범위가 설정되면 자동으로 검색 상태 활성화
        setIsSearching(true);
      } else {
        setDateRangeText({ start: null, end: null });
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

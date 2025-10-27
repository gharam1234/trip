"use client";

import { useState } from "react";

// 툴팁 표시 상태 인터페이스
interface TooltipState {
  isVisible: boolean;
  position: { x: number; y: number };
}

// 툴팁 훅의 반환 타입
interface UseTooltipReturn {
  tooltipState: TooltipState;
  handleMouseEnter: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
  getTooltipMessage: (address?: string) => string;
}

// 툴팁 초기 상태
const initialTooltipState: TooltipState = {
  isVisible: false,
  position: { x: 0, y: 0 },
};

/**
 * 툴팁 기능을 제공하는 커스텀 훅
 * - iconLocation 요소에 마우스 호버 시 툴팁 표시
 * - 상세주소 정보가 없을 경우 기본 메시지 표시
 */
export function useTooltip(): UseTooltipReturn {
  // 툴팁 표시 상태 관리
  const [tooltipState, setTooltipState] = useState<TooltipState>(initialTooltipState);

  // 마우스 호버 시 툴팁 표시
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const iconLocationRect = event.currentTarget.getBoundingClientRect();

    // 부모 요소(writerRowBottom) 기준의 상대좌표 계산
    const parentElement = event.currentTarget.parentElement;
    const parentRect = parentElement?.getBoundingClientRect();

    // 상대좌표 = 자식좌표 - 부모좌표
    const x = iconLocationRect.left - (parentRect?.left || 0) + iconLocationRect.width / 2;
    const y = iconLocationRect.top - (parentRect?.top || 0) - 10; // 요소 위쪽에 표시

    setTooltipState({
      isVisible: true,
      position: { x, y },
    });
  };

  // 마우스 떠남 시 툴팁 숨김
  const handleMouseLeave = () => {
    setTooltipState({
      isVisible: false,
      position: { x: 0, y: 0 },
    });
  };

  // 툴팁에 표시할 메시지 반환 (address이 있으면 해당 값, 없으면 기본 메시지)
  const getTooltipMessage = (address?: string): string => {
    if (address && address.trim() !== "") {
      return address;
    }
    return "상세주소 정보 없음";
  };

  return {
    tooltipState,
    handleMouseEnter,
    handleMouseLeave,
    getTooltipMessage,
  };
}


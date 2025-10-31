'use client';

import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

/**
 * mainCard 컴포넌트의 라우팅 기능 제공 훅
 * - 카드 클릭 시 해당 게시글의 상세 페이지로 이동
 * - url.ts의 BOARD_DETAIL 경로를 사용하여 동적으로 경로 생성
 *
 * @returns { handleCardClick } - 카드 클릭 핸들러 함수
 */
export function useMainCardRouting() {
  const router = useRouter();

  /**
   * 카드 클릭 핸들러
   * - 전달된 카드 ID를 사용하여 BOARD_DETAIL 경로로 이동
   *
   * @param cardId - 카드의 _id (게시글 ID)
   */
  const handleCardClick = (cardId: string) => {
    const path = getPath('BOARD_DETAIL', { BoardId: cardId });
    try {
      router.push(path);
    } finally {
      if (typeof window !== 'undefined') {
        // 라우터 네비게이션이 실패하거나 지연되는 경우를 대비한 안전장치
        setTimeout(() => {
          if (window.location.pathname === '/boards') {
            window.location.href = path;
          }
        }, 0);
      }
    }
  };

  return {
    handleCardClick,
  };
}

"use client";

import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

/**
 * 트립토크 등록 페이지로 이동하는 Hook
 * - url.ts의 BOARD_NEW 경로를 사용하여 하드코딩 방지
 * - Next.js App Router의 useRouter를 사용한 클라이언트 사이드 라우팅
 */
export function useLinkToNewBoard() {
  const router = useRouter();

  /**
   * 트립토크 등록 페이지로 이동
   */
  const navigateToNewBoard = () => {
    const newBoardPath = getPath('BOARD_NEW');
    router.push(newBoardPath);
  };

  return {
    navigateToNewBoard,
  };
}

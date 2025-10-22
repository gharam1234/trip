"use client";

import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';
import { useAuthGuard } from '@/commons/providers/auth/auth.guard.hook';

// 트립토크 등록 페이지로 이동하는 Hook (권한 검증 포함)
// - url.ts의 BOARD_NEW 경로를 사용하여 하드코딩 방지
// - Next.js App Router의 useRouter를 사용한 클라이언트 사이드 라우팅
// - 권한 검증을 통해 로그인된 사용자만 접근 가능
export function useLinkToNewBoard() {
  const router = useRouter();
  const { guard } = useAuthGuard();

  // 트립토크 등록 페이지로 이동 (권한 검증 포함)
  // - 로그인된 사용자: /boards/new 페이지로 이동
  // - 비로그인 사용자: 로그인 확인 모달 표시
  const navigateToNewBoard = guard(() => {
    const newBoardPath = getPath('BOARD_NEW');
    router.push(newBoardPath);
  });

  return {
    navigateToNewBoard,
  };
}

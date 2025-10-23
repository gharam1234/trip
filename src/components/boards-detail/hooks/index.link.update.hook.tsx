'use client';

import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

// 게시글 수정 페이지로 이동하는 훅
// - Next.js App Router의 useRouter 사용
// - url.ts의 BOARD_EDIT 경로를 사용하여 하드코딩 방지
export function useBoardEditLink() {
  const router = useRouter();

  // 게시글 수정 페이지로 이동
  // - boardId: 게시글 ID
  const navigateToEdit = (boardId: string) => {
    const editPath = getPath('BOARD_EDIT', { BoardId: boardId });
    router.push(editPath);
  };

  return {
    navigateToEdit,
  };
}

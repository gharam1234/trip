import { useRouter } from 'next/navigation';
import { linkTo } from '@/commons/constants/url';

// 게시글 라우팅 훅
// - 요구사항: 각 게시글 클릭시 url.ts의 페이지URL에 정의된 경로로 이동
// - boardId를 사용하여 동적 라우팅 처리

export interface UseBoardRoutingReturn {
  // 게시글 상세페이지로 이동하는 함수
  navigateToBoardDetail: (boardId: string) => void;
}

export function useBoardRouting(): UseBoardRoutingReturn {
  const router = useRouter();

  // 게시글 상세페이지로 이동
  const navigateToBoardDetail = (boardId: string): void => {
    // url.ts의 BOARD_DETAIL 경로를 사용하여 동적 라우팅
    const detailPath = linkTo('BOARD_DETAIL', { BoardId: boardId });
    router.push(detailPath);
  };

  return {
    navigateToBoardDetail,
  };
}

import { useRouter } from 'next/navigation';
import { getPath, RouteKey } from '@/commons/constants/url';

/**
 * 레이아웃 내 네비게이션 요소들의 라우팅을 처리하는 훅
 */
export function useLinkRouting() {
  const router = useRouter();

  /**
   * 특정 경로로 이동하는 함수
   * @param routeKey - 이동할 경로의 키
   * @param params - 동적 경로 파라미터 (선택사항)
   */
  const navigateTo = (routeKey: RouteKey, params?: Record<string, string | number>) => {
    const path = getPath(routeKey, params);
    router.push(path);
  };

  /**
   * 로고 클릭 시 게시글 목록 페이지로 이동
   */
  const handleLogoClick = () => {
    navigateTo('BOARDS_LIST');
  };

  return {
    navigateTo,
    handleLogoClick,
  };
}

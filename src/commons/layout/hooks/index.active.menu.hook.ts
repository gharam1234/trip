import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { getNavigationMenuItems, NavigationMenuItem } from '@/commons/constants/url';

/**
 * 현재 라우트에 따라 활성 메뉴를 감지하는 훅
 * - url.ts의 URLS 설정에서 동적으로 메뉴 아이템 생성
 * - 메뉴 활성화 상태를 동적으로 결정
 */
export function useActiveMenu() {
  const pathname = usePathname();

  /**
   * URL 설정에서 메뉴 아이템을 동적으로 생성
   * - url.ts의 navigationMenu 설정을 기반으로 함
   */
  const menuItems = useMemo(() => {
    return getNavigationMenuItems();
  }, []);

  /**
   * 현재 경로가 메뉴 아이템과 일치하는지 확인
   */
  const isMenuActive = (pathPattern: RegExp): boolean => {
    return pathPattern.test(pathname);
  };

  /**
   * 활성 메뉴 ID 반환
   * - 현재 경로와 일치하는 메뉴를 찾음
   * - 일치하는 메뉴가 없으면 첫 번째 메뉴를 기본값으로 설정
   */
  const activeMenuId = useMemo(() => {
    const activeMenu = menuItems.find((menu) => isMenuActive(menu.pathPattern));
    return activeMenu?.id || menuItems[0]?.id || 'trip-talk';
  }, [pathname, menuItems]);

  return {
    activeMenuId,
    menuItems,
    isMenuActive,
  };
}

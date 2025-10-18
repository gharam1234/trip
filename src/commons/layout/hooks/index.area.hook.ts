"use client";

import { usePathname } from "next/navigation";
import { URLS, RouteKey, isBannerVisible, isNavigationVisible } from "../../constants/url";

/**
 * 현재 경로에 따라 banner와 navigation 영역의 노출 여부를 제어하는 hook
 * url.ts의 설정에 따라 각 영역의 가시성을 결정합니다.
 */
export function useAreaVisibility() {
  const pathname = usePathname();

  /**
   * 현재 경로와 일치하는 라우트 키를 찾는 함수
   * 1단계: 정확한 경로 매칭 (/boards/new)
   * 2단계: 동적 세그먼트 매칭 (/boards/[BoardId])
   */
  const findMatchingRouteKey = (): RouteKey | null => {
    // 1단계: 정확한 경로 매칭 (동적 세그먼트 없음)
    // /boards/new가 /boards/[BoardId]로 매칭되는 것을 방지
    for (const [key, config] of Object.entries(URLS)) {
      const pathTemplate = config.pathTemplate;

      // 동적 세그먼트가 없는 경로만 확인
      if (!pathTemplate.includes("[") && pathTemplate === pathname) {
        return key as RouteKey;
      }
    }

    // 2단계: 동적 세그먼트 매칭
    for (const [key, config] of Object.entries(URLS)) {
      const pathTemplate = config.pathTemplate;

      // 동적 세그먼트가 있는 경로만 확인
      if (pathTemplate.includes("[") && pathTemplate.includes("]")) {
        const pattern = pathTemplate
          .replace(/\[.*?\]/g, "[^/]+") // [BoardId] -> [^/]+
          .replace(/\//g, "\\/"); // / -> \/
        const regex = new RegExp(`^${pattern}$`);

        if (regex.test(pathname)) {
          return key as RouteKey;
        }
      }
    }

    return null;
  };

  const routeKey = findMatchingRouteKey();

  // 현재 경로에 해당하는 라우트가 없으면 기본값으로 banner와 navigation을 모두 표시
  const showBanner = routeKey ? isBannerVisible(routeKey) : true;
  const showNavigation = routeKey ? isNavigationVisible(routeKey) : true;

  return {
    showBanner,
    showNavigation,
    routeKey,
  };
}

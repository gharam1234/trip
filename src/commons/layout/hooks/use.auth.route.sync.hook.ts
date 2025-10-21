'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/commons/providers/auth/auth.provider';

/**
 * 라우트 변화에 따른 인증상태 재동기화 훅
 * 로그인 직후 새로고침 없이도 레이아웃 우측(프로필/유저이름/셀렉트박스)이 즉시 반영되도록 함
 */
export function useAuthRouteSync() {
  const pathname = usePathname();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // 경로 변경 시마다 로컬스토리지와 인증컨텍스트를 즉시 동기화
    checkAuthStatus();
  }, [pathname, checkAuthStatus]);
}

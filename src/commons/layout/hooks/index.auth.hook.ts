'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/commons/providers/auth/auth.provider';

/**
 * 레이아웃에서 사용할 인증 관련 훅
 * 인증 프로바이더의 기능을 활용하여 로그인 상태에 따른 UI 분기 처리
 */
export function useLayoutAuth() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  // 로그인 상태 확인
  const isLoggedIn = isAuthenticated;

  // 사용자 이름 조회
  const userName = user?.name || user?.email || '';

  // 로그인 버튼 클릭 핸들러
  const handleLoginClick = () => {
    // Next.js 라우터 이동을 우선 시도하고, 실패 시 location.href로 폴백 처리
    try {
      router.push('/auth/login');
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  // 로그아웃 버튼 클릭 핸들러
  const handleLogoutClick = () => {
    logout();
  };

  // 드롭다운 토글 핸들러
  const handleDropdownToggle = () => {
    // 드롭다운 토글 로직은 CSS나 별도 상태로 관리
    // 여기서는 기본적인 클릭 이벤트만 처리
  };

  return {
    isLoggedIn,
    userName,
    handleLoginClick,
    handleLogoutClick,
    handleDropdownToggle,
  };
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


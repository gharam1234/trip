import { useAuth } from '@/commons/providers/auth/auth.provider';

/**
 * 레이아웃에서 사용할 인증 관련 훅
 * 인증 프로바이더의 기능을 활용하여 로그인 상태에 따른 UI 분기 처리
 */
export function useLayoutAuth() {
  const { isAuthenticated, user, login, logout } = useAuth();

  // 로그인 상태 확인
  const isLoggedIn = isAuthenticated;

  // 사용자 이름 조회
  const userName = user?.name || user?.email || '';

  // 로그인 버튼 클릭 핸들러
  const handleLoginClick = () => {
    // 로그인 페이지로 이동은 auth provider의 redirectToLogin이 아닌
    // Next.js 라우터를 직접 사용하여 처리
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
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

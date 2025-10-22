'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth.provider';
import { useModal } from '../modal/modal.provider';
import { Modal as CommonModal } from '@/commons/components/modal';
import { Modal as ProviderModal } from '../modal/modal.provider';
import { getPath, URLS, RouteKey, isAccessible, AccessState } from '@/commons/constants/url';


// 모달 ID 상수
const LOGIN_REQUIRED_MODAL_ID = 'login-required-modal';

// 테스트 환경 변수 및 전역 변수 타입 정의
declare global {
  interface Window {
    __TEST_BYPASS__?: boolean;
    __TEST_ENV__?: string;
  }
}

// AuthGuard 컴포넌트 Props 타입
interface AuthGuardProps {
  children: React.ReactNode;
}

// AuthGuard 컴포넌트
export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const { openModal, closeAllModals, isModalOpen } = useModal();
  
  // 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // 모달이 이미 표시되었는지 확인하기 위한 ref
  const modalShownRef = useRef<boolean>(false);

  // 테스트 환경 여부 확인
  const isTestEnvironment = useCallback(() => {
    // 클라이언트 사이드에서는 window 객체를 통해 확인
    if (typeof window !== 'undefined') {
      return window.__TEST_ENV__ === 'test' || process.env.NEXT_PUBLIC_TEST_ENV === 'test';
    }
    // 서버 사이드에서는 환경 변수로 확인
    return process.env.NEXT_PUBLIC_TEST_ENV === 'test';
  }, []);

  // 로그인 검사 우회 여부 확인
  const shouldBypassAuth = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // 테스트 환경인 경우
    if (isTestEnvironment()) {
      // window.__TEST_BYPASS__가 명시적으로 true로 설정된 경우에만 우회
      return window.__TEST_BYPASS__ === true;
    }
    
    // 실제 환경에서는 항상 검사 수행 (비로그인 유저로 간주)
    return false;
  }, [isTestEnvironment]);

  // 현재 경로에 해당하는 라우트 키 찾기
  const getCurrentRouteKey = useCallback((): RouteKey | null => {
    // 정확한 경로 매칭을 위해 URLS의 모든 키를 확인
    for (const [key, config] of Object.entries(URLS)) {
      const routeKey = key as RouteKey;
      const template = config.pathTemplate;
      
      // 정확한 경로 매칭 (동적 세그먼트 제외)
      if (template === pathname) {
        return routeKey;
      }
      
      // 동적 세그먼트가 있는 경로 매칭
      if (template.includes('[') && template.includes(']')) {
        // 동적 세그먼트를 정규식으로 변환
        const regexPattern = template
          .replace(/\[([^\]]+)\]/g, '([^/]+)') // [BoardId] -> ([^/]+)
          .replace(/\//g, '\\/'); // / -> \/
        
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(pathname)) {
          return routeKey;
        }
      }
    }
    
    return null;
  }, [pathname]);

  // 권한 검증 함수
  const checkAuthorization = useCallback(async () => {
    // AuthProvider 초기화 대기
    const authStatus = checkAuthStatus();
    
    // 우회 조건 확인 (테스트 환경에서 우회 시 로그인된 것으로 간주)
    if (shouldBypassAuth()) {
      setIsAuthorized(true);
      setIsInitialized(true);
      return;
    }
    
    // 현재 경로에 해당하는 라우트 키 찾기
    const routeKey = getCurrentRouteKey();
    
    if (!routeKey) {
      // 라우트 키를 찾을 수 없는 경우 (404 등) 접근 허용
      setIsAuthorized(true);
      setIsInitialized(true);
      return;
    }
    
    // 접근 권한 확인 - isAccessible 함수는 isAuthenticated boolean 값을 받음
    const hasAccess = isAccessible(routeKey, authStatus);
    
    if (hasAccess) {
      // 접근 권한이 있는 경우
      setIsAuthorized(true);
      setIsInitialized(true);
    } else {
      // 접근 권한이 없는 경우
      setIsAuthorized(false);
      setIsInitialized(true);
      
      // 로그인 확인 모달 표시 (한 번만)
      if (!modalShownRef.current) {
        modalShownRef.current = true;
        openModal(LOGIN_REQUIRED_MODAL_ID);
      }
    }
  }, [checkAuthStatus, shouldBypassAuth, getCurrentRouteKey, openModal]);

  // 컴포넌트 마운트 시 권한 검증
  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  // 경로 변경 시 권한 재검증
  useEffect(() => {
    if (isInitialized) {
      modalShownRef.current = false;
      checkAuthorization();
    }
  }, [pathname, isInitialized, checkAuthorization]);

  // 로그인 페이지로 이동
  const handleLoginClick = useCallback(() => {
    closeAllModals();
    modalShownRef.current = false;
    // Next.js router를 사용하여 페이지 이동
    window.location.href = getPath('AUTH_LOGIN');
  }, [closeAllModals]);

  // 로딩 중이거나 권한이 없는 경우 빈 화면 표시
  if (!isInitialized || !isAuthorized) {
    return (
      <>
        {/* 빈 화면 - 로딩 중이거나 권한이 없는 경우 */}
        <div 
          style={{ 
            width: '100vw', 
            height: '100vh', 
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          data-testid="auth-guard-loading"
        >
          {!isInitialized && (
            <div data-testid="auth-guard-loading-text">로딩 중...</div>
          )}
        </div>
        
        {/* 로그인 필요 모달 */}
        {isModalOpen(LOGIN_REQUIRED_MODAL_ID) && (
          <ProviderModal
            id={LOGIN_REQUIRED_MODAL_ID}
            isOpen={isModalOpen(LOGIN_REQUIRED_MODAL_ID)}
            onClose={() => {}}
            data-testid="login-required-modal"
          >
            <CommonModal
              variant="info"
              actions="single"
              title="로그인이 필요합니다"
              description="이 페이지에 접근하려면 로그인이 필요합니다."
              confirmText="확인"
              onConfirm={handleLoginClick}
            />
          </ProviderModal>
        )}
      </>
    );
  }

  // 권한이 있는 경우 children 렌더링
  return <>{children}</>;
}

export default AuthGuard;
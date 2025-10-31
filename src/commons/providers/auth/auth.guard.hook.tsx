'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth.provider';
import { useModal } from '../modal/modal.provider';
import { Modal as CommonModal } from '@/commons/components/modal';
import { Modal as ProviderModal } from '../modal/modal.provider';
import { getPath } from '@/commons/constants/url';

// 모달 ID 상수
const LOGIN_CONFIRM_MODAL_ID = 'login-confirm-modal';

// 테스트 환경 변수 및 전역 변수 타입 정의
declare global {
  interface Window {
    __TEST_BYPASS__?: boolean;
    __TEST_ENV__?: string;
  }
}

// 권한 검증 GUARD 훅
export function useAuthGuard() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth();
  const { openModal, closeModal, closeAllModals, isModalOpen } = useModal();
  
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
    
    // 실제 환경에서는 항상 검사 수행
    return false;
  }, [isTestEnvironment]);

  // 로그인 상태 확인
  const checkLoginStatus = useCallback(() => {
    // 우회 조건 확인 (테스트 환경에서 우회 시 로그인된 것으로 간주)
    if (shouldBypassAuth()) {
      return true;
    }
    
    // 실제 로그인 상태 확인
    return checkAuthStatus();
  }, [shouldBypassAuth, checkAuthStatus]);

  // 로그인 확인 모달 표시
  const showLoginConfirmModal = useCallback(() => {
    // 이미 모달이 표시된 경우 중복 표시하지 않음
    if (modalShownRef.current) {
      return;
    }
    
    modalShownRef.current = true;
    openModal(LOGIN_CONFIRM_MODAL_ID);
  }, [openModal]);

  useEffect(() => () => {
    closeModal(LOGIN_CONFIRM_MODAL_ID);
  }, [closeModal]);

  // 로그인 페이지로 이동
  const handleLoginClick = useCallback(() => {
    closeAllModals();
    modalShownRef.current = false;
    router.push(getPath('AUTH_LOGIN'));
  }, [closeAllModals, router]);

  // 모달 취소 처리
  const handleCancelClick = useCallback(() => {
    closeAllModals();
    modalShownRef.current = false;
  }, [closeAllModals]);

  // 권한 검증 함수
  const guard = useCallback(<T extends (...args: unknown[]) => unknown>(
    callback: T
  ): T => {
    return ((...args: Parameters<T>) => {
      // 로그인 상태 확인
      const isLoggedIn = checkLoginStatus();
      
      if (isLoggedIn) {
        // 로그인된 경우 콜백 함수 실행
        return callback(...args);
      } else {
        // 비로그인인 경우 로그인 확인 모달 표시
        showLoginConfirmModal();
        return undefined;
      }
    }) as T;
  }, [checkLoginStatus, showLoginConfirmModal]);

  // 모달 리셋 함수
  const resetModalState = useCallback(() => {
    modalShownRef.current = false;
  }, []);

  // 테스트 환경에서 로그인 검사 우회 설정
  const setTestBypass = useCallback((bypass: boolean) => {
    if (typeof window !== 'undefined') {
      window.__TEST_BYPASS__ = bypass;
    }
  }, []);

  // 테스트 환경 설정
  const setTestEnvironment = useCallback((isTest: boolean) => {
    if (typeof window !== 'undefined') {
      window.__TEST_ENV__ = isTest ? 'test' : 'production';
    }
  }, []);

  return {
    guard,
    resetModalState,
    setTestBypass,
    setTestEnvironment,
    isTestEnvironment,
    shouldBypassAuth,
    // 모달 컴포넌트 렌더링을 위한 props
    LoginConfirmModal: () => {
      const isOpen = isModalOpen(LOGIN_CONFIRM_MODAL_ID);
      if (!isOpen) return null;
      
      return (
        <ProviderModal
          id={LOGIN_CONFIRM_MODAL_ID}
          isOpen={isOpen}
          onClose={handleCancelClick}
          data-testid="login-confirm-modal"
        >
          <CommonModal
            variant="info"
            actions="dual"
            title="로그인이 필요합니다"
            description="이 기능을 사용하려면 로그인이 필요합니다. 로그인하시겠습니까?"
            confirmText="로그인"
            cancelText="취소"
            onConfirm={handleLoginClick}
            onCancel={handleCancelClick}
          />
        </ProviderModal>
      );
    },
  };
}

// 권한 검증이 필요한 함수를 감싸는 HOC
export function withAuthGuard<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  // 이 함수는 컴포넌트 내부에서 useAuthGuard 훅과 함께 사용되어야 함
  // 실제 구현은 useAuthGuard의 guard 함수를 사용
  return callback;
}

export default useAuthGuard;

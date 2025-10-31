'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPath } from '@/commons/constants/url';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  // 로그인 상태
  isAuthenticated: boolean;
  // Provider 마운트 완료 여부
  mounted: boolean;
  // 로그인된 사용자 정보
  user: any | null;
  // 로그인 함수
  login: (userData: any, accessToken: string, expiresIn?: number) => void;
  // 로그아웃 함수
  logout: () => void;
  // 로그인 상태 확인 함수
  checkAuthStatus: () => boolean;
  // 사용자 정보 조회 함수
  getUserInfo: () => any | null;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 로컬스토리지 키 상수
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const TOKEN_EXPIRES_AT_KEY = 'tokenExpiresAt';

// AuthProvider 컴포넌트
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const logoutTimerRef = useRef<number | null>(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // 로그아웃 함수 (useCallback으로 메모이제이션)
  const logout = useCallback((): void => {
    if (typeof window === 'undefined') return;
    
    try {
      clearLogoutTimer();
      // 로컬스토리지에서 토큰과 사용자 정보 제거
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
      
      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      
      // 로그인 페이지로 이동
      router.push(getPath('AUTH_LOGIN'));
    } catch (error) {
      console.error('로그아웃 처리 오류:', error);
    }
  }, [clearLogoutTimer, router]);

  const scheduleLogout = useCallback((tokenExpiresAt: number) => {
    if (typeof window === 'undefined') return;

    clearLogoutTimer();

    const remainingTime = tokenExpiresAt - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout();
    }, remainingTime);
  }, [clearLogoutTimer, logout]);

  // 로그인 함수 (useCallback으로 메모이제이션)
  const login = useCallback((userData: any, accessToken: string, expiresIn: number = 3600): void => {
    if (typeof window === 'undefined') return;

    try {
      const safeExpiresIn = Math.max(expiresIn, 0);
      const tokenExpiresAt = Date.now() + safeExpiresIn * 1000;
      // 로컬스토리지에 토큰과 사용자 정보 저장
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, tokenExpiresAt.toString());
      
      // 상태 업데이트
      setIsAuthenticated(true);
      setUser(userData);

      scheduleLogout(tokenExpiresAt);
      
      // 로그인 성공 시 게시글 목록 페이지로 이동
      router.push(getPath('BOARDS_LIST'));
    } catch (error) {
      console.error('로그인 처리 오류:', error);
    }
  }, [router, scheduleLogout]);

  // 로그인 상태 확인 함수 (useCallback으로 메모이제이션)
  const checkAuthStatus = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    const isTestBypassActive =
      (window.__TEST_ENV__ === 'test' || process.env.NEXT_PUBLIC_TEST_ENV === 'test') &&
      window.__TEST_BYPASS__ === true;

    if (isTestBypassActive) {
      const userData = localStorage.getItem(USER_KEY);
      setIsAuthenticated(true);

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('사용자 정보 파싱 오류:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      return true;
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    const tokenExpiresAtRaw = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);

    if (!accessToken) {
      clearLogoutTimer();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
      return false;
    }

    if (!tokenExpiresAtRaw) {
      logout();
      return false;
    }

    const tokenExpiresAt = Number(tokenExpiresAtRaw);

    if (Number.isNaN(tokenExpiresAt)) {
      logout();
      return false;
    }

    if (Date.now() >= tokenExpiresAt) {
      logout();
      return false;
    }

    setIsAuthenticated(true);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        logout();
        return false;
      }
    } else {
      setUser(null);
    }

    scheduleLogout(tokenExpiresAt);

    return true;
  }, [clearLogoutTimer, logout, scheduleLogout]);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    checkAuthStatus();
    setMounted(true);

    return () => {
      clearLogoutTimer();
    };
  }, [checkAuthStatus, clearLogoutTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuthStatus]);

  // 사용자 정보 조회 함수 (useCallback으로 메모이제이션)
  const getUserInfo = useCallback((): any | null => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      return null;
    }
  }, []);

  // 로그인 페이지로 이동하는 함수
  const redirectToLogin = (): void => {
    router.push(getPath('AUTH_LOGIN'));
  };

  // 컨텍스트 값
  const contextValue: AuthContextType = {
    isAuthenticated,
    mounted,
    user,
    login,
    logout,
    checkAuthStatus,
    getUserInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth 훅 - 하위 컴포넌트에서 인증 관련 기능을 사용할 수 있도록 함
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};

// 인증이 필요한 컴포넌트를 위한 HOC
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, checkAuthStatus } = useAuth();
    
    useEffect(() => {
      if (!isAuthenticated) {
        checkAuthStatus();
      }
    }, [isAuthenticated, checkAuthStatus]);
    
    if (!isAuthenticated) {
      return null; // 또는 로딩 스피너
    }
    
    return <Component {...props} />;
  };
};

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)

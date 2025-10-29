'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { getPath } from '@/commons/constants/url';

/**
 * localStorage 토큰 키 상수
 * 프로젝트에서 사용 가능한 모든 토큰 키 목록
 */
const TOKEN_KEYS = ['authToken', 'token', 'access_token', 'accessToken'];
const USER_KEY = 'user';

/**
 * 로그아웃 처리 결과 인터페이스
 */
export interface LogoutResult {
  success: boolean;
  error?: string;
}

/**
 * useLogout Hook
 * 사용자 로그아웃 기능을 담당하는 커스텀 훅
 * localStorage에서 토큰 정보를 삭제하고 로그인 페이지로 이동
 */
export function useLogout() {
  const router = useRouter();

  /**
   * 로그아웃 처리 함수
   * localStorage에서 토큰과 사용자 정보를 삭제하고 로그인 페이지로 이동
   */
  const handleLogout = useCallback(async (): Promise<LogoutResult> => {
    try {
      // 클라이언트 사이드에서만 실행
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: '클라이언트 환경이 아닙니다.',
        };
      }

      // localStorage에서 모든 토큰 정보 삭제
      TOKEN_KEYS.forEach((key) => {
        localStorage.removeItem(key);
      });
      
      // 사용자 정보 삭제
      localStorage.removeItem(USER_KEY);

      // 로그인 페이지로 이동 (URL 경로 사용)
      router.push(getPath('AUTH_LOGIN'));

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('로그아웃 처리 오류:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [router]);

  return {
    handleLogout,
  };
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 12:25:26
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


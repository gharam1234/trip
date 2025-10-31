'use client';

import { useEffect, useRef, useState } from 'react';

// React Hook Form 관련
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod 관련
import { z } from 'zod';

// Apollo Client 관련
import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Next.js 관련
import { useRouter } from 'next/navigation';

// 내부 컴포넌트/유틸
import { useModal } from '@/commons/providers/modal/modal.provider';
import { getPath } from '@/commons/constants/url';
import { useAuth } from '@/commons/providers/auth/auth.provider';

/**
 * GraphQL 뮤테이션 정의
 */
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      accessToken
    }
  }
`;

const FETCH_USER_LOGGED_IN = gql`
  query FetchUserLoggedIn {
    fetchUserLoggedIn {
      _id
      email
      name
      userPoint {
        amount
      }
    }
  }
`;

/**
 * Zod 스키마 정의
 */
const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('이메일 형식이 올바르지 않습니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 로그인 폼 훅
 * @returns 폼 상태, 핸들러 함수들
 */
export function useLoginForm() {
  const router = useRouter();
  const { openModal, closeAllModals } = useModal();
  const { login } = useAuth();
  const client = useApolloClient();
  const [pendingAccessToken, setPendingAccessToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [pendingExpiresIn, setPendingExpiresIn] = useState<number | null>(null);
  const [loginSucceeded, setLoginSucceeded] = useState<boolean>(false);
  const pendingAccessTokenRef = useRef<string | null>(null);
  const pendingUserRef = useRef<any | null>(null);
  const pendingExpiresInRef = useRef<number | null>(null);

  useEffect(() => {
    pendingAccessTokenRef.current = pendingAccessToken;
  }, [pendingAccessToken]);

  useEffect(() => {
    pendingUserRef.current = pendingUser;
  }, [pendingUser]);

  useEffect(() => {
    pendingExpiresInRef.current = pendingExpiresIn;
  }, [pendingExpiresIn]);

  const deriveExpiresIn = (accessToken: string): number => {
    if (!accessToken) return 3600;

    try {
      const [, payload] = accessToken.split('.');
      if (!payload) return 3600;

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

      if (typeof window === 'undefined' || typeof window.atob !== 'function') {
        return 3600;
      }

      const decoded = window.atob(padded);
      const parsed = JSON.parse(decoded);

      if (typeof parsed?.exp !== 'number') return 3600;

      const expiresAtMs = parsed.exp * 1000;
      const remainingMs = expiresAtMs - Date.now();
      const remainingSeconds = Math.max(Math.floor(remainingMs / 1000), 0);

      return remainingSeconds;
    } catch (error) {
      console.warn('토큰 만료 시간 파싱 실패:', error);
      return 3600;
    }
  };
  
  // 폼 설정
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * 로그인 뮤테이션
   */
  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER, {
    onCompleted: async (data: any) => {
      console.log('로그인 성공 - 응답 데이터:', data);
      try {
        // accessToken을 로컬스토리지에 저장
        const accessToken = data.loginUser.accessToken;
        const expiresIn = deriveExpiresIn(accessToken);
        localStorage.setItem('accessToken', accessToken);
        console.log('accessToken 저장 완료:', accessToken);
        setPendingAccessToken(accessToken);
        pendingAccessTokenRef.current = accessToken;
        setPendingExpiresIn(expiresIn);
        pendingExpiresInRef.current = expiresIn;
        setLoginSucceeded(true);
        openModal('login-success-modal');

        try {
          const response = await client.query({
            query: FETCH_USER_LOGGED_IN,
            fetchPolicy: 'network-only',
          });
          const fetchedUser = response.data?.fetchUserLoggedIn ?? null;
          setPendingUser(fetchedUser);
          pendingUserRef.current = fetchedUser;
        } catch (fetchError) {
          console.error('로그인 후 사용자 정보 조회 실패:', fetchError);
          setPendingUser(null);
          pendingUserRef.current = null;
        }

      } catch (error) {
        console.error('로그인 처리 오류:', error);
        // 로그인 실패 시 실패 모달 표시
        setPendingAccessToken(null);
        setPendingUser(null);
        setPendingExpiresIn(null);
        pendingAccessTokenRef.current = null;
        pendingUserRef.current = null;
        pendingExpiresInRef.current = null;
        setLoginSucceeded(false);
        openModal('login-fail-modal');
      }
    },
    onError: (error: any) => {
      console.error('로그인 실패 - 에러 상세:', error);
      console.error('에러 메시지:', error.message);
      console.error('에러 네트워크:', error.networkError);
      console.error('에러 그래프QL:', error.graphQLErrors);
      // 로그인실패모달 표시
      setPendingAccessToken(null);
      setPendingUser(null);
      setPendingExpiresIn(null);
      pendingAccessTokenRef.current = null;
      pendingUserRef.current = null;
      pendingExpiresInRef.current = null;
      setLoginSucceeded(false);
      openModal('login-fail-modal');
    },
  });

  /**
   * 로그인 처리 함수
   * @param data - 폼 데이터
   */
  const handleLogin = async (data: LoginFormData) => {
    try {
      // 데이터 검증
      if (!data.email || !data.password) {
        console.error('이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }

      // 로그인 뮤테이션 실행
      await loginUser({
        variables: {
          email: data.email.trim(),
          password: data.password,
        },
      });
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      // 에러 발생 시 실패 모달 표시
      openModal('login-fail-modal');
    }
  };

  /**
   * 모달 확인 버튼 클릭 처리
   */
  const handleModalConfirm = () => {
    const accessToken =
      pendingAccessTokenRef.current ??
      (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

    if (loginSucceeded && accessToken) {
      const userInfo =
        pendingUserRef.current ??
        {
          email: form.getValues('email'),
          name: form.getValues('email'),
        };

      const expiresIn = pendingExpiresInRef.current ?? 3600;

      login(userInfo, accessToken, expiresIn);

      // 라우터 네비게이션과 함께 하드 리다이렉트 보조 처리
      const boardsPath = getPath('BOARDS_LIST');
      try {
        router.push(boardsPath);
      } catch (error) {
        // 무시 - window.location으로 폴백
      }
      if (typeof window !== 'undefined') {
        window.location.assign(boardsPath);
      }

      setPendingAccessToken(null);
      setPendingUser(null);
      setPendingExpiresIn(null);
      pendingAccessTokenRef.current = null;
      pendingUserRef.current = null;
      pendingExpiresInRef.current = null;
      setLoginSucceeded(false);
      closeAllModals();
      return;
    }

    closeAllModals();
    setLoginSucceeded(false);
    router.push(getPath('AUTH_LOGIN'));
  };

  return {
    form,
    handleLogin,
    handleModalConfirm,
    loginLoading,
  };
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)

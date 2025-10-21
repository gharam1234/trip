'use client';

// React Hook Form 관련
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod 관련
import { z } from 'zod';

// Apollo Client 관련
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Next.js 관련
import { useRouter } from 'next/navigation';

// 내부 컴포넌트/유틸
import { useModal } from '@/commons/providers/modal/modal.provider';
import { getPath } from '@/commons/constants/url';

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
      name
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
  
  // 폼 설정
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
        localStorage.setItem('accessToken', data.loginUser.accessToken);
        console.log('accessToken 저장 완료:', data.loginUser.accessToken);
        
        // 사용자 정보 조회를 위한 Apollo Client 설정
        const { ApolloClient, InMemoryCache } = await import('@apollo/client');
        const { createHttpLink } = await import('@apollo/client/link/http');
        
        // 새로운 Apollo Client 인스턴스 생성 (인증 헤더 포함)
        const httpLink = createHttpLink({
          uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://main-practice.codebootcamp.co.kr/graphql",
          headers: {
            Authorization: `Bearer ${data.loginUser.accessToken}`,
          },
        });
        
        const client = new ApolloClient({
          link: httpLink,
          cache: new InMemoryCache(),
        });
        
        // fetchUserLoggedIn 쿼리 실행
        const userResult = await client.query({
          query: FETCH_USER_LOGGED_IN,
        });
        
        // 사용자 정보를 로컬스토리지에 저장
        const userData = {
          _id: userResult.data.fetchUserLoggedIn._id,
          name: userResult.data.fetchUserLoggedIn.name,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('사용자 정보 저장 완료:', userData);
        
        // 로그인완료모달 표시
        openModal('login-success-modal');
        
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        // 사용자 정보 조회 실패 시에도 로그인은 성공으로 처리
        openModal('login-success-modal');
      }
    },
    onError: (error: any) => {
      console.error('로그인 실패 - 에러 상세:', error);
      console.error('에러 메시지:', error.message);
      console.error('에러 네트워크:', error.networkError);
      console.error('에러 그래프QL:', error.graphQLErrors);
      // 로그인실패모달 표시
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
    closeAllModals();
    
    // 현재 열린 모달이 로그인완료모달인지 확인
    const isSuccessModal = document.querySelector('[data-testid="login-success-modal"]');
    if (isSuccessModal) {
      // 게시글 목록 페이지로 이동
      router.push(getPath('BOARDS_LIST'));
    }
  };

  return {
    form,
    handleLogin,
    handleModalConfirm,
    loginLoading,
  };
}

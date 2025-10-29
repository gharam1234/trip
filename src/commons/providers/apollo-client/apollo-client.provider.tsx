"use client";

import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
// @ts-expect-error - apollo-upload-client 타입 정의 문제
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { ReactNode } from "react";
import { setContext } from "@apollo/client/link/context";

// AuthLink - 각 요청에 Authorization 헤더 추가
const authLink = setContext((_, { headers }) => {
  // 로컬스토리지에서 토큰 가져오기
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    
    // 토큰이 있으면 Authorization 헤더에 추가
    if (accessToken) {
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }
  }
  
  return { headers };
});

// 업로드 링크 생성
const uploadLink = new UploadHttpLink({
  uri:
    (typeof window !== 'undefined' && (window as any).__TEST_ENV__ === 'test') ||
    process.env.NEXT_PUBLIC_TEST_ENV === 'test'
      ? '/api/graphql'
      : process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://main-practice.codebootcamp.co.kr/graphql",
});

// 두 링크를 결합 (authLink -> uploadLink)
const link = authLink.concat(uploadLink);
 
// Apollo Client 인스턴스 생성
const client = new ApolloClient({
  link: link, // 인증 헤더가 포함된 링크 사용
  cache: new InMemoryCache({
    // 캐시 정책 설정
    typePolicies: {
      Query: {
        fields: {
          // 필요에 따라 특정 필드의 캐시 정책을 설정할 수 있습니다
        },
      },
    },
  }),
  // 기본 옵션 설정
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all", // 에러가 발생해도 캐시된 데이터를 반환
    },
    query: {
      errorPolicy: "all",
    },
  },
});

interface ApolloClientProviderProps {
  children: ReactNode;
}

/**
 * Apollo Client Provider 컴포넌트
 * GraphQL 클라이언트를 앱 전체에서 사용할 수 있도록 제공합니다.
 * Authorization 헤더를 자동으로 모든 요청에 추가합니다.
 */
export default function ApolloClientProvider({ children }: ApolloClientProviderProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


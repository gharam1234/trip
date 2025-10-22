"use client";

import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
// @ts-expect-error - apollo-upload-client 타입 정의 문제
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { ReactNode } from "react";

// 업로드 링크 생성
const uploadLink = new UploadHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://main-practice.codebootcamp.co.kr/graphql",
});

// Apollo Client 인스턴스 생성
const client = new ApolloClient({
  link: uploadLink, // 업로드 링크 사용 (파일 업로드 지원)
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
 */
export default function ApolloClientProvider({ children }: ApolloClientProviderProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

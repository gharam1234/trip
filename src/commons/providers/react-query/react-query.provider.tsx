"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // QueryClient를 컴포넌트 내부에서 생성하여 각 렌더링마다 새로운 인스턴스가 생성되지 않도록 함
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 데이터가 오래된 것으로 간주되는 시간 (5분)
            staleTime: 5 * 60 * 1000,
            // 캐시에서 데이터를 유지하는 시간 (10분)
            gcTime: 10 * 60 * 1000,
            // 네트워크 오류 시 재시도 횟수
            retry: 3,
            // 재시도 간격 (지수 백오프)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // 윈도우 포커스 시 자동 리페치 비활성화
            refetchOnWindowFocus: false,
            // 네트워크 재연결 시 자동 리페치 활성화
            refetchOnReconnect: true,
          },
          mutations: {
            // 뮤테이션 실패 시 재시도 횟수
            retry: 1,
            // 뮤테이션 재시도 간격
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

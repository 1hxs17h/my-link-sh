"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // QueryClient 인스턴스는 렌더링 간 재생성되지 않도록 useState로 한 번만 초기화합니다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 리소스 절약 & 불필요한 네트워크 요청 방지 설정
            staleTime: 1000 * 60 * 5, // 5분 동안 fresh 유지
            gcTime: 1000 * 60 * 30, // 30분 동안 캐시 보존
            refetchOnWindowFocus: false, // 창 포커스 복귀 시 자동 재조회 비활성화 (Firestore 읽기 쿼터 절약)
            refetchOnReconnect: false, // 네트워크 재연결 시 자동 재조회 비활성화
            refetchOnMount: false, // 마운트 시 데이터가 신선하면 재요청 생략
            retry: 1, // 실패 시 최대 1회만 재시도
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

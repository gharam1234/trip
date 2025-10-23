"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPath } from "@/commons/constants/url";

/**
 * 목록 페이지로 이동하는 훅
 * - Next.js App Router의 useRouter를 사용하여 이동
 * - 하드코딩 금지: url.ts의 URLS/헬퍼 사용
 */
export function useBoardListLink() {
  const router = useRouter();

  const navigateToList = useCallback(() => {
    // 목록 경로 생성 (동적 파라미터 없음)
    const listPath = getPath("BOARDS_LIST");
    router.push(listPath);
  }, [router]);

  return { navigateToList };
}



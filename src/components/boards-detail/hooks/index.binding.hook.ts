"use client";

import { useQuery } from "@apollo/client/react";
import { FETCH_BOARD, FetchBoardResponse } from "../graphql/queries";

// 게시글 상세 주소 입력 타입
interface BoardAddressInput {
  zipcode?: string;
  address?: string;
  addressDetail?: string;
}

// 게시글 데이터 타입 (API 응답과 컴포넌트 사용을 위한 통합 인터페이스)
export interface BoardData {
  _id: string;
  writer: string;
  title: string;
  contents: string;
  youtubeUrl?: string;
  boardAddress?: BoardAddressInput;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  likeCount?: number;
  dislikeCount?: number;
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

// 바인딩 훅의 반환 타입
interface UseBoardDetailBindingReturn {
  boardData: BoardData | null;
  loading: boolean;
  error: string | null;
}

/**
 * 게시글 상세 바인딩 훅
 * Apollo Client의 useQuery를 통해 fetchBoard GraphQL API를 호출하여 데이터를 바인딩합니다.
 *
 * @param boardId - URL 파라미터에서 추출한 게시글 ID
 * @returns 게시글 데이터, 로딩 상태, 에러 메시지
 */
export function useBoardDetailBinding(
  boardId: string
): UseBoardDetailBindingReturn {
  // Apollo Client useQuery를 사용하여 fetchBoard 쿼리 실행
  const { data, loading, error } = useQuery<FetchBoardResponse>(FETCH_BOARD, {
    variables: { boardId },
    skip: !boardId, // boardId가 없으면 쿼리 실행하지 않음
    errorPolicy: "all", // 에러 발생 시에도 캐시된 데이터 반환
  });

  // API 응답을 컴포넌트에서 사용 가능한 형태로 변환
  const boardData = data?.fetchBoard || null;

  // 에러 메시지 추출
  const errorMessage = error
    ? error.message || "게시글을 불러오는 중 오류가 발생했습니다."
    : null;

  return {
    boardData,
    loading,
    error: errorMessage,
  };
}

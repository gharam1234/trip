"use client";

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { FETCH_BOARDS, FetchBoardsResponse, BoardApiItem } from '../graphql/queries';
import { formatBoardDate } from '@/commons/utils/date';

// 리스트 표시용 데이터 타입
export interface BoardListItem {
  no: string; // _id를 문자열로 변환
  title: string;
  author: string; // writer를 author로 매핑
  date: string; // createdAt을 포맷팅된 날짜로 변환
}

/**
 * Apollo Client useQuery를 사용하여 fetchBoards API 데이터를 가져와서 리스트 표시용으로 변환하는 Hook
 * - 실제 API 데이터를 사용 (Mock 데이터 사용하지 않음)
 * - 데이터가 없을 경우 빈 배열 반환
 * - 제목이 길 경우 "..."으로 표시하여 칸 사이즈 유지
 * - 검색 파라미터 지원 (search, startDate, endDate, page)
 *
 * @param search - 제목 검색어 (선택사항)
 * @param startDate - 시작 날짜 YYYY-MM-DD 형식 (선택사항)
 * @param endDate - 종료 날짜 YYYY-MM-DD 형식 (선택사항)
 * @param page - 페이지 번호 (기본값: 1)
 * @returns { boards, loading, error } - 변환된 게시글 리스트 및 상태
 */
export function useBoardsBinding(
  search?: string | null,
  startDate?: string | null,
  endDate?: string | null,
  page: number = 1
) {
  const { data, loading, error } = useQuery<FetchBoardsResponse>(FETCH_BOARDS, {
    variables: {
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: page
    },
    fetchPolicy: 'network-only' // 항상 서버에서 최신 데이터 가져오기
  });

  // API 데이터를 리스트 표시용으로 변환
  const boards: BoardListItem[] = React.useMemo(() => {
    if (!data?.fetchBoards) {
      return [];
    }

    return data.fetchBoards.map((board: BoardApiItem) => ({
      no: board._id,
      title: truncateText(board.title, 50),
      author: board.writer,
      date: formatBoardDate(board.createdAt)
    }));
  }, [data]);

  return {
    boards,
    loading,
    error: error?.message || null
  };
}

/**
 * 텍스트를 최대 길이로 자르고 "..."으로 표시
 * @param text - 자를 텍스트
 * @param maxLength - 최대 길이
 * @returns 자르거나 원본 텍스트
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


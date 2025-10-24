"use client";

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { FETCH_BOARDS, FetchBoardsResponse, BoardApiItem } from '../graphql/queries';

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
 */
export function useBoardsBinding() {
  const { data, loading, error } = useQuery<FetchBoardsResponse>(FETCH_BOARDS, {
    variables: {
      page: 1
    }
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
      date: formatDate(board.createdAt)
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

/**
 * 날짜 문자열을 YYYY.MM.DD 형식으로 포맷팅
 * @param dateString - ISO 날짜 문자열 또는 기타 날짜 형식
 * @returns 포맷팅된 날짜 문자열
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // 파싱 실패 시 원본 반환
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  } catch {
    return dateString; // 오류 시 원본 반환
  }
}

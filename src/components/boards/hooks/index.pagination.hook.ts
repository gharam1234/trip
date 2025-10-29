"use client";

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { FETCH_BOARDS, FETCH_BOARD_COUNT, FetchBoardsResponse, FetchBoardsCountResponse, BoardApiItem } from '../graphql/queries';
import { formatBoardDate } from '@/commons/utils/date';

// 리스트 표시용 데이터 타입
export interface BoardListItem {
  no: string; // _id를 문자열로 변환
  title: string;
  author: string; // writer를 author로 매핑
  date: string; // createdAt을 포맷팅된 날짜로 변환
}

// usePagination Hook 반환 타입
export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  boards: BoardListItem[];
  loading: boolean;
  error: string | null;
  handlePageChange: (page: number) => void;
}

/**
 * 페이지네이션 기능을 제공하는 Hook
 * - 검색어, 시작 날짜, 종료 날짜를 파라미터로 받음
 * - 필터 변경 시 자동으로 페이지 1로 리셋
 * - Apollo Client useQuery를 사용하여 데이터 조회
 * - totalPages는 Math.ceil(totalCount / 10)으로 계산
 * - 페이지당 10개의 게시글 표시
 *
 * @param keyword - 제목 검색어
 * @param startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate - 종료 날짜 (YYYY-MM-DD 형식)
 * @returns { currentPage, totalPages, boards, loading, error, handlePageChange }
 */
export function usePagination(
  keyword: string = '',
  startDate: string | null = null,
  endDate: string | null = null
): UsePaginationReturn {
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // 필터 변경 감지 - 페이지를 1로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [keyword, startDate, endDate]);

  // FETCH_BOARDS 쿼리 실행
  const { data: boardsData, loading: boardsLoading, error: boardsError } = useQuery<FetchBoardsResponse>(
    FETCH_BOARDS,
    {
      variables: {
        search: keyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage
      },
      fetchPolicy: 'network-only'
    }
  );

  // FETCH_BOARD_COUNT 쿼리 실행
  const { data: countData, loading: countLoading, error: countError } = useQuery<FetchBoardsCountResponse>(
    FETCH_BOARD_COUNT,
    {
      variables: {
        search: keyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      },
      fetchPolicy: 'network-only'
    }
  );

  // 총 페이지 수 계산
  const totalCount = countData?.fetchBoardsCount ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  // API 데이터를 리스트 표시용으로 변환
  const boards: BoardListItem[] = React.useMemo(() => {
    if (!boardsData?.fetchBoards) {
      return [];
    }

    return boardsData.fetchBoards.map((board: BoardApiItem) => ({
      no: board._id,
      title: truncateText(board.title, 50),
      author: board.writer,
      date: formatBoardDate(board.createdAt)
    }));
  }, [boardsData]);

  // 에러 메시지 처리
  const error: string | null = boardsError?.message || countError?.message || null;

  // 로딩 상태
  const loading: boolean = boardsLoading || countLoading;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    boards,
    loading,
    error,
    handlePageChange
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


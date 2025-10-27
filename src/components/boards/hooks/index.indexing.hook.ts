"use client";

import { useQuery } from '@apollo/client/react';
import { FETCH_BOARD_COUNT, FetchBoardsCountResponse } from '../graphql/queries';

/**
 * 게시글 번호 계산을 위한 Hook
 * - totalCount를 가져와서 페이지 번호와 인덱스를 기반으로 게시글 번호를 계산
 * - 최신글일수록 큰 숫자가 표시되도록 역순 계산
 * - 1페이지당 10개의 게시글
 *
 * @param page - 현재 페이지 번호 (1부터 시작)
 * @param index - 배열 내 인덱스 (0부터 시작)
 * @returns 계산된 게시글 번호
 */
export function useIndexing(page: number = 1) {
  const { data, loading, error } = useQuery<FetchBoardsCountResponse>(FETCH_BOARD_COUNT);

  /**
   * 게시글 번호 계산 함수
   * totalCount - ((page - 1) * 10 + index)
   *
   * 예시:
   * - totalCount = 100, page = 1, index = 0 -> 100
   * - totalCount = 100, page = 1, index = 9 -> 91
   * - totalCount = 100, page = 2, index = 0 -> 90
   */
  function calculateNumber(index: number): number {
    if (!data?.fetchBoardsCount) {
      return 0;
    }
    const totalCount = data.fetchBoardsCount;
    return totalCount - ((page - 1) * 10 + index);
  }

  return {
    calculateNumber,
    totalCount: data?.fetchBoardsCount || 0,
    loading,
    error: error?.message || null
  };
}

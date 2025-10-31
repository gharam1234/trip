"use client";

import React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  FETCH_BOARDS,
  FETCH_BOARDS_OF_THE_BEST,
  FetchBoardsOfTheBestResponse,
  FetchBoardsResponse,
  MainCardApiItem
} from '../graphql/queries';
import { formatBoardDate } from '@/commons/utils/date';

export const DEFAULT_CARD_IMAGE = '/images/sample.png';
const DEFAULT_PROFILE_IMAGE = '/icons/profile.png';

// 메인카드 표시용 데이터 타입
export interface MainCardItem {
  id: string; // _id
  title: string;
  authorName: string; // user.name
  authorImage: string; // user.picture
  likeCount: number;
  imageUrl: string; // images[0]
  date: string; // createdAt을 YYYY.MM.DD 형식으로 포맷팅
}

/**
 * Apollo Client useQuery를 사용하여 메인카드 표시용 데이터를 가져오는 Hook
 * - 1순위: fetchBoardsOfTheBest (좋아요 상위 게시글) 사용
 * - 2순위: 상위 데이터가 없거나 쿼리 실패 시 fetchBoards로 대체
 * - likeCount 기준 내림차순 정렬 후 상위 4개 반환
 * - 실제 API 데이터를 사용 (Mock 데이터 사용하지 않음)
 * - 이미지는 images 배열의 첫 번째 요소만 사용 (없으면 기본 이미지)
 * - 날짜는 YYYY.MM.DD 형식으로 변환
 *
 * @returns { cards, loading, error } - 메인카드 리스트 및 상태
 */
export function useMainCardBinding() {
  const {
    data: bestData,
    loading: bestLoading,
    error: bestError
  } = useQuery<FetchBoardsOfTheBestResponse>(FETCH_BOARDS_OF_THE_BEST, {
    fetchPolicy: 'network-only' // 항상 서버에서 최신 데이터 가져오기
  });

  const shouldFetchFallback =
    !bestLoading && (!bestData?.fetchBoardsOfTheBest || bestData.fetchBoardsOfTheBest.length === 0);

  const {
    data: fallbackData,
    loading: fallbackLoading,
    error: fallbackError
  } = useQuery<FetchBoardsResponse>(FETCH_BOARDS, {
    fetchPolicy: 'network-only',
    skip: !shouldFetchFallback
  });

  const boardsSource = bestData?.fetchBoardsOfTheBest?.length
    ? bestData.fetchBoardsOfTheBest
    : fallbackData?.fetchBoards ?? [];

  // API 데이터를 메인카드 표시용으로 변환
  const cards: MainCardItem[] = React.useMemo(() => {
    if (!boardsSource || boardsSource.length === 0) {
      return [];
    }

    // likeCount 기준으로 내림차순 정렬하여 상위 4개만 반환
    const normalizedBoards: MainCardItem[] = boardsSource
      .filter((board): board is MainCardApiItem => Boolean(board?._id))
      .map((board) => {
        const title = board.title?.trim() || '제목 없음';
        const likeCountValue = Number(board.likeCount);
        const likeCount = Number.isFinite(likeCountValue) ? likeCountValue : 0;
        const userName = typeof board.user?.name === 'string' ? board.user.name.trim() : '';
        const writerName = typeof board.writer === 'string' ? board.writer.trim() : '';
        const authorName = userName || writerName || '익명';
        const authorImage = board.user?.picture?.trim() || DEFAULT_PROFILE_IMAGE;
        // images[0]만 사용하고 값이 없으면 기본 카드 이미지로 대체한다.
        const firstImage = Array.isArray(board.images) ? board.images[0] : null;
        const primaryImage =
          typeof firstImage === 'string' && firstImage.trim().length > 0
            ? firstImage
            : DEFAULT_CARD_IMAGE;

        return {
          id: board._id,
          title,
          authorName,
          authorImage,
          likeCount,
          imageUrl: primaryImage, // 배열의 첫 번째 이미지만 사용 (없으면 기본이미지)
          date: formatBoardDate(board.createdAt)
        };
      });

    return normalizedBoards
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 4);
  }, [boardsSource]);

  return {
    cards,
    loading: bestLoading || (shouldFetchFallback && fallbackLoading),
    error:
      fallbackError?.message ||
      (!shouldFetchFallback && cards.length === 0 ? bestError?.message || null : null)
  };
}

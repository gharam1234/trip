"use client";

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { FETCH_BOARDS, FetchBoardsResponse, MainCardApiItem } from '../graphql/queries';
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
 * Apollo Client useQuery를 사용하여 fetchBoards API 데이터를 가져와서 메인카드 표시용으로 변환하는 Hook
 * - 실제 API 데이터를 사용 (Mock 데이터 사용하지 않음)
 * - likeCount 기준으로 내림차순 정렬
 * - 정렬된 결과에서 상위 4개만 반환
 * - 데이터가 없을 경우 빈 배열 반환
 * - 이미지는 images 배열의 첫 번째 요소만 사용
 * - 날짜는 YYYY.MM.DD 형식으로 변환
 *
 * @returns { cards, loading, error } - 메인카드 리스트 및 상태
 */
export function useMainCardBinding() {
  const { data, loading, error } = useQuery<FetchBoardsResponse>(FETCH_BOARDS, {
    fetchPolicy: 'network-only' // 항상 서버에서 최신 데이터 가져오기
  });

  // API 데이터를 메인카드 표시용으로 변환
  const cards: MainCardItem[] = React.useMemo(() => {
    if (!data?.fetchBoards || data.fetchBoards.length === 0) {
      return [];
    }

    // likeCount 기준으로 내림차순 정렬하여 상위 4개만 반환
    const normalizedBoards: MainCardItem[] = data.fetchBoards
      .filter((board): board is MainCardApiItem => Boolean(board?._id))
      .map((board) => {
        const title = board.title?.trim() || '제목 없음';
        const likeCount = typeof board.likeCount === 'number' ? board.likeCount : 0;
        const authorName = board.user?.name?.trim() || '익명';
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
  }, [data]);

  return {
    cards,
    loading,
    error: error?.message || null
  };
}

"use client";

import { BoardData } from "./index.binding.hook";

export interface LikeDislikeCounts {
  likeCount: number;
  dislikeCount: number;
}

/**
 * 좋아요/싫어요 카운트 추출 훅
 *
 * 기능:
 * - boardData에서 likeCount, dislikeCount 추출
 * - null/undefined인 경우 0으로 기본값 처리
 * - 실제 GraphQL API 데이터를 기반으로 카운트 제공
 *
 * @param boardData - 게시글 데이터 (useBoardDetailBinding에서 받음)
 * @returns likeCount와 dislikeCount를 포함한 객체
 */
export function useLikeDislikeCounts(boardData: BoardData | null): LikeDislikeCounts {
  return {
    likeCount: boardData?.likeCount ?? 0,
    dislikeCount: boardData?.dislikeCount ?? 0,
  };
}

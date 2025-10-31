"use client";

import { useMutation } from "@apollo/client/react";
import {
  LIKE_BOARD,
  LikeBoardResponse,
  LikeBoardVariables,
  DISLIKE_BOARD,
  DislikeBoardResponse,
  DislikeBoardVariables,
} from "../graphql/mutations";
import { FETCH_BOARD, FetchBoardResponse } from "../graphql/queries";
import { useCallback } from "react";

/**
 * 좋아요/싫어요 뮤테이션 결과 타입
 */
export interface LikeDislikeMutationResult {
  isLiking: boolean;
  isDisliking: boolean;
  likeError: Error | null;
  dislikeError: Error | null;
  handleLike: (boardId: string) => Promise<void>;
  handleDislike: (boardId: string) => Promise<void>;
}

/**
 * 좋아요/싫어요 기능 훅
 *
 * 기능:
 * - useMutation을 사용하여 likeBoard, dislikeBoard 뮤테이션 호출
 * - 뮤테이션 완료 후 Apollo Client 캐시 업데이트
 * - 로딩 상태 및 에러 상태 처리
 *
 * @returns 좋아요/싫어요 뮤테이션 함수 및 상태
 */
export function useLikeDislikeFunction(): LikeDislikeMutationResult {
  // likeBoard 뮤테이션 설정
  const [likeBoard, { loading: isLiking, error: likeError }] = useMutation<
    LikeBoardResponse,
    LikeBoardVariables
  >(LIKE_BOARD, {
    // 뮤테이션 완료 후 캐시 업데이트 함수
    update(cache, { data }, { variables }) {
      const updatedLikeCount = data?.likeBoard;
      const boardId = variables?.boardId;

      if (updatedLikeCount === undefined || !boardId) return;

      // 현재 캐시된 FETCH_BOARD 데이터 조회 (해당 boardId 기준)
      const cachedData = cache.readQuery<FetchBoardResponse>({
        query: FETCH_BOARD,
        variables: { boardId },
      });

      if (!cachedData?.fetchBoard) return;

      // 캐시 업데이트: likeCount를 새로운 값으로 설정
      cache.writeQuery<FetchBoardResponse>({
        query: FETCH_BOARD,
        variables: { boardId },
        data: {
          fetchBoard: {
            ...cachedData.fetchBoard,
            likeCount: updatedLikeCount,
          },
        },
      });
    },
    // refetch를 통한 캐시 업데이트를 위한 설정
    refetchQueries: ({ variables }) => {
      if (variables?.boardId) {
        return [
          {
            query: FETCH_BOARD,
            variables: { boardId: variables.boardId },
          },
        ];
      }
      return [];
    },
    awaitRefetchQueries: true,
  });

  // dislikeBoard 뮤테이션 설정
  const [dislikeBoard, { loading: isDisliking, error: dislikeError }] =
    useMutation<DislikeBoardResponse, DislikeBoardVariables>(DISLIKE_BOARD, {
      // 뮤테이션 완료 후 캐시 업데이트 함수
      update(cache, { data }, { variables }) {
        const updatedDislikeCount = data?.dislikeBoard;
        const boardId = variables?.boardId;

        if (updatedDislikeCount === undefined || !boardId) return;

        // 현재 캐시된 FETCH_BOARD 데이터 조회 (해당 boardId 기준)
        const cachedData = cache.readQuery<FetchBoardResponse>({
          query: FETCH_BOARD,
          variables: { boardId },
        });

        if (!cachedData?.fetchBoard) return;

        // 캐시 업데이트: dislikeCount를 새로운 값으로 설정
        cache.writeQuery<FetchBoardResponse>({
          query: FETCH_BOARD,
          variables: { boardId },
          data: {
            fetchBoard: {
              ...cachedData.fetchBoard,
              dislikeCount: updatedDislikeCount,
            },
          },
        });
      },
      // refetch를 통한 캐시 업데이트를 위한 설정
      refetchQueries: ({ variables }) => {
        if (variables?.boardId) {
          return [
            {
              query: FETCH_BOARD,
              variables: { boardId: variables.boardId },
            },
          ];
        }
        return [];
      },
      awaitRefetchQueries: true,
    });

  // 좋아요 버튼 클릭 핸들러
  const handleLike = useCallback(
    async (boardId: string) => {
      try {
        if (!boardId) return;

        // likeBoard 뮤테이션 호출
        await likeBoard({
          variables: { boardId },
        });
      } catch (error) {
        // 에러 로깅 (실제 환경에서는 에러 트래킹 서비스 사용)
        console.error("좋아요 요청 실패:", error);
      }
    },
    [likeBoard]
  );

  // 싫어요 버튼 클릭 핸들러
  const handleDislike = useCallback(
    async (boardId: string) => {
      try {
        if (!boardId) return;

        // dislikeBoard 뮤테이션 호출
        await dislikeBoard({
          variables: { boardId },
        });
      } catch (error) {
        // 에러 로깅 (실제 환경에서는 에러 트래킹 서비스 사용)
        console.error("싫어요 요청 실패:", error);
      }
    },
    [dislikeBoard]
  );

  return {
    isLiking,
    isDisliking,
    likeError: likeError || null,
    dislikeError: dislikeError || null,
    handleLike,
    handleDislike,
  };
}

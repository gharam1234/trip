import { gql } from "@apollo/client";

/**
 * 게시글 좋아요 Mutation
 * 지정된 게시글에 좋아요를 추가하고 업데이트된 좋아요 수를 반환합니다.
 */
export const LIKE_BOARD = gql`
  mutation likeBoard($boardId: ID!) {
    likeBoard(boardId: $boardId)
  }
`;

/**
 * LikeBoard Mutation 응답 타입
 */
export interface LikeBoardResponse {
  likeBoard: number;
}

/**
 * LikeBoard Mutation 변수 타입
 */
export interface LikeBoardVariables {
  boardId: string;
}

/**
 * 게시글 싫어요 Mutation
 * 지정된 게시글에 싫어요를 추가하고 업데이트된 싫어요 수를 반환합니다.
 */
export const DISLIKE_BOARD = gql`
  mutation dislikeBoard($boardId: ID!) {
    dislikeBoard(boardId: $boardId)
  }
`;

/**
 * DislikeBoard Mutation 응답 타입
 */
export interface DislikeBoardResponse {
  dislikeBoard: number;
}

/**
 * DislikeBoard Mutation 변수 타입
 */
export interface DislikeBoardVariables {
  boardId: string;
}

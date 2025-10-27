import { gql } from "@apollo/client";

/**
 * 게시판 삭제 Mutation
 */
export const DELETE_BOARD = gql`
  mutation deleteBoard($boardId: ID!) {
    deleteBoard(boardId: $boardId)
  }
`;

/**
 * DeleteBoard Mutation 응답 타입
 */
export interface DeleteBoardResponse {
  deleteBoard: string;
}

/**
 * DeleteBoard Mutation 변수 타입
 */
export interface DeleteBoardVariables {
  boardId: string;
}

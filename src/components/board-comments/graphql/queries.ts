import { gql } from "@apollo/client";

/**
 * 댓글 목록 조회 Query
 */
export const FETCH_BOARD_COMMENTS = gql`
  query FetchBoardComments($boardId: ID!, $page: Int) {
    fetchBoardComments(boardId: $boardId, page: $page) {
      _id
      writer
      contents
      rating
      createdAt
      updatedAt
      deletedAt
      user {
        _id
        email
        name
      }
    }
  }
`;

/**
 * FetchBoardComments Query 응답 타입
 */
export interface FetchBoardCommentsResponse {
  fetchBoardComments: BoardCommentApiItem[];
}

/**
 * API 응답 데이터 타입
 */
export interface BoardCommentApiItem {
  _id: string;
  writer: string;
  contents: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: {
    _id: string;
    email: string;
    name: string;
  };
}

import { gql } from "@apollo/client";

/**
 * 전체 게시글 목록 조회 Query (메인카드용)
 * - 좋아요 순서대로 정렬하여 상위 4개 카드 표시
 */
export const FETCH_BOARDS = gql`
  query FetchBoards {
    fetchBoards {
      _id
      title
      user {
        name
        picture
      }
      likeCount
      images
      createdAt
    }
  }
`;

/**
 * FetchBoard Query 응답 타입
 */
export interface FetchBoardsResponse {
  fetchBoards: MainCardApiItem[];
}

/**
 * API 응답 데이터 타입
 */
export interface MainCardApiItem {
  _id: string;
  title: string;
  user?: {
    name?: string | null;
    picture?: string | null;
  } | null;
  likeCount?: number | null;
  images?: (string | null)[] | null;
  createdAt: string;
}

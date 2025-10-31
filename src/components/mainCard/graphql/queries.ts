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
      writer
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
 * 좋아요 상위 게시글 조회 Query
 * - GraphQL 서버에서 제공하는 fetchBoardsOfTheBest 사용
 */
export const FETCH_BOARDS_OF_THE_BEST = gql`
  query FetchBoardsOfTheBest {
    fetchBoardsOfTheBest {
      _id
      title
      writer
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
 * FetchBoardsOfTheBest Query 응답 타입
 */
export interface FetchBoardsOfTheBestResponse {
  fetchBoardsOfTheBest: MainCardApiItem[];
}

/**
 * API 응답 데이터 타입
 */
export interface MainCardApiItem {
  _id: string;
  title: string;
  writer?: string | null;
  user?: {
    name?: string | null;
    picture?: string | null;
  } | null;
  likeCount?: number | string | null;
  images?: (string | null)[] | null;
  createdAt: string;
}

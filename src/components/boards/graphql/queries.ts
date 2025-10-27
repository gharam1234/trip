import { gql } from "@apollo/client";

/**
 * 게시판 목록 조회 Query
 */
export const FETCH_BOARDS = gql`
  query FetchBoards($page: Int) {
    fetchBoards(page: $page) {
      _id
      writer
      title
      contents
      createdAt
    }
  }
`;

/**
 * FetchBoards Query 응답 타입
 */
export interface FetchBoardsResponse {
  fetchBoards: BoardApiItem[];
}

/**
 * API 응답 데이터 타입
 */
export interface BoardApiItem {
  _id: string;
  writer: string;
  title: string;
  contents: string;
  createdAt: string;
}

/**
 * 게시판 총 개수 조회 Query
 */
export const FETCH_BOARD_COUNT = gql`
  query FetchBoardsCount {
    fetchBoardsCount
  }
`;

/**
 * FetchBoardsCount Query 응답 타입
 */
export interface FetchBoardsCountResponse {
  fetchBoardsCount: number;
}

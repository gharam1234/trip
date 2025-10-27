import { gql } from "@apollo/client";

/**
 * 게시판 목록 조회 Query
 * - search: 제목 검색어
 * - startDate: 시작 날짜 (DateTime)
 * - endDate: 종료 날짜 (DateTime)
 * - page: 페이지 번호
 */
export const FETCH_BOARDS = gql`
  query FetchBoards(
    $search: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int
  ) {
    fetchBoards(
      search: $search
      startDate: $startDate
      endDate: $endDate
      page: $page
    ) {
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

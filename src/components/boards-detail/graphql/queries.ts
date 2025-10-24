import { gql } from "@apollo/client";

/**
 * 게시판 상세 조회 Query
 */
export const FETCH_BOARD = gql`
  query FetchBoard($boardId: ID!) {
    fetchBoard(boardId: $boardId) {
      _id
      writer
      title
      contents
      youtubeUrl
      likeCount
      dislikeCount
      images
      boardAddress {
        zipcode
        address
        addressDetail
      }
      user {
        _id
        email
        name
      }
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

/**
 * FetchBoard Query 응답 타입
 */
export interface FetchBoardResponse {
  fetchBoard: Board;
}

/**
 * API 응답 데이터 타입
 */
export interface Board {
  _id: string;
  writer: string;
  title: string;
  contents: string;
  youtubeUrl?: string;
  likeCount: number;
  dislikeCount: number;
  images?: string[];
  boardAddress?: {
    zipcode?: string;
    address?: string;
    addressDetail?: string;
  };
  user?: {
    _id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

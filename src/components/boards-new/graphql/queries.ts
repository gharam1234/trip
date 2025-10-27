import { gql } from "@apollo/client";

/**
 * 게시판 상세 조회 Query
 */
export const GET_BOARD = gql`
  query getBoard($boardId: ID!) {
    getBoard(boardId: $boardId) {
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
 * GetBoard Query 응답 타입
 */
export interface GetBoardResponse {
  getBoard: {
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
  };
}

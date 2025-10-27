import { gql } from "@apollo/client";

/**
 * 댓글 작성 Mutation
 */
export const CREATE_BOARD_COMMENT = gql`
  mutation CreateBoardComment(
    $boardId: ID!
    $createBoardCommentInput: CreateBoardCommentInput!
  ) {
    createBoardComment(
      boardId: $boardId
      createBoardCommentInput: $createBoardCommentInput
    ) {
      _id
      writer
      contents
      rating
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
 * 댓글 수정 Mutation
 */
export const UPDATE_BOARD_COMMENT = gql`
  mutation UpdateBoardComment(
    $boardCommentId: ID!
    $updateBoardCommentInput: UpdateBoardCommentInput!
    $password: String
  ) {
    updateBoardComment(
      boardCommentId: $boardCommentId
      updateBoardCommentInput: $updateBoardCommentInput
      password: $password
    ) {
      _id
      writer
      contents
      rating
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
 * 댓글 삭제 Mutation
 */
export const DELETE_BOARD_COMMENT = gql`
  mutation DeleteBoardComment($boardCommentId: ID!, $password: String) {
    deleteBoardComment(boardCommentId: $boardCommentId, password: $password)
  }
`;

/**
 * CreateBoardComment Mutation 입력 타입
 */
export interface CreateBoardCommentInput {
  writer?: string;
  password?: string;
  contents: string;
  rating: number;
}

/**
 * CreateBoardComment Mutation 응답 타입
 */
export interface CreateBoardCommentResponse {
  createBoardComment: {
    _id: string;
    writer?: string;
    contents: string;
    rating: number;
    user?: {
      _id: string;
      email: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };
}

/**
 * UpdateBoardComment Mutation 입력 타입
 */
export interface UpdateBoardCommentInput {
  contents?: string;
  rating?: number;
}

/**
 * UpdateBoardComment Mutation 응답 타입
 */
export interface UpdateBoardCommentResponse {
  updateBoardComment: {
    _id: string;
    writer?: string;
    contents: string;
    rating: number;
    user?: {
      _id: string;
      email: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };
}

/**
 * DeleteBoardComment Mutation 응답 타입
 */
export interface DeleteBoardCommentResponse {
  deleteBoardComment: boolean;
}

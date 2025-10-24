import { gql } from "@apollo/client";

/**
 * 파일 업로드 Mutation
 */
export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      url
    }
  }
`;

/**
 * 게시판 생성 Mutation
 */
export const CREATE_BOARD = gql`
  mutation createBoard($createBoardInput: CreateBoardInput!) {
    createBoard(createBoardInput: $createBoardInput) {
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
 * UploadFile Mutation 응답 타입
 */
export interface UploadFileResponse {
  uploadFile: {
    url: string;
  };
}

/**
 * CreateBoardInput 타입 정의
 */
export interface CreateBoardInput {
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl?: string;
  boardAddress?: {
    zipcode?: string;
    address?: string;
    addressDetail?: string;
  };
  images?: string[];
}

/**
 * CreateBoard Mutation 응답 타입
 */
export interface CreateBoardResponse {
  createBoard: {
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

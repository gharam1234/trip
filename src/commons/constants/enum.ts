/**
 * 게시판 관련 타입 정의
 */

/**
 * 주소 입력 타입 정의
 */
export interface BoardAddressInput {
  zipcode?: string;
  address?: string;
  addressDetail?: string;
}

/**
 * 게시판 폼 데이터 타입 정의
 */
export interface BoardFormData {
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl?: string;
  boardAddress: BoardAddressInput;
  images?: string[];
}

/**
 * 로컬스토리지에 저장될 게시판 데이터 타입
 */
export interface BoardData {
  boardId: string;
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl: string;
  boardAddress: BoardAddressInput;
  images: string[];
  createdAt: string;
}

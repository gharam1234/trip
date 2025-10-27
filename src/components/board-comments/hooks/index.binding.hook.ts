import { useQuery } from "@apollo/client/react";
import {
  FETCH_BOARD_COMMENTS,
  FetchBoardCommentsResponse,
  BoardCommentApiItem,
} from "../graphql/queries";

/**
 * 포맷된 댓글 데이터 타입
 */
export interface FormattedCommentItem {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

/**
 * 날짜를 "YYYY.MM.DD HH:mm" 형식으로 포맷
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

/**
 * API 응답 데이터를 포맷된 댓글로 변환
 */
const transformComment = (comment: BoardCommentApiItem): FormattedCommentItem => {
  return {
    id: comment._id,
    author: comment.writer || comment.user?.name || "익명",
    rating: comment.rating,
    content: comment.contents,
    date: formatDate(comment.createdAt),
  };
};

/**
 * 게시판 댓글 목록 조회 및 데이터 바인딩 훅
 * @param boardId - 게시판 ID
 * @param page - 페이지 번호 (선택사항)
 * @returns 댓글 목록, 로딩 상태, 에러 정보
 */
export const useBoardComments = (boardId: string, page?: number) => {
  const { data, loading, error, refetch } = useQuery<FetchBoardCommentsResponse>(
    FETCH_BOARD_COMMENTS,
    {
      variables: {
        boardId,
        page: page ?? 1,
      },
      skip: !boardId,
    }
  );

  const comments: FormattedCommentItem[] = data?.fetchBoardComments
    ? data.fetchBoardComments.map(transformComment)
    : [];

  return {
    comments,
    loading,
    error,
    refetch,
  };
};

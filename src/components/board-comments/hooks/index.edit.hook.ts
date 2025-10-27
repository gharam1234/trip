import { useMutation } from "@apollo/client/react";
import {
  UPDATE_BOARD_COMMENT,
  DELETE_BOARD_COMMENT,
  UpdateBoardCommentInput,
  UpdateBoardCommentResponse,
  DeleteBoardCommentResponse,
} from "../graphql/mutations";
import { FETCH_BOARD_COMMENTS } from "../graphql/queries";

/**
 * 댓글 수정/삭제 Hook 반환 타입
 */
export interface UseBoardCommentEditReturn {
  updateComment: (
    boardCommentId: string,
    input: UpdateBoardCommentInput,
    password: string,
    boardId: string
  ) => Promise<void>;
  deleteComment: (boardCommentId: string, password: string, boardId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * 내용 유효성 검증 (1자 이상)
 */
const validateContents = (contents: string | undefined): boolean => {
  if (!contents) return true; // 내용은 선택사항 (수정 시)
  return contents.trim().length >= 1;
};

/**
 * 평점 유효성 검증 (1~5)
 */
const validateRating = (rating: number | undefined): boolean => {
  if (rating === undefined) return true; // 평점은 선택사항 (수정 시)
  return rating >= 1 && rating <= 5;
};

/**
 * 댓글 수정/삭제 Hook
 * @param onSuccess - 성공 시 콜백 (목록 새로고침 등)
 * @returns updateComment, deleteComment 함수, loading 상태, error 정보
 */
export const useBoardCommentEdit = (
  onSuccess?: () => void
): UseBoardCommentEditReturn => {
  const [updateMutation, { loading: updateLoading, error: updateError }] = useMutation<
    UpdateBoardCommentResponse
  >(UPDATE_BOARD_COMMENT);

  const [deleteMutation, { loading: deleteLoading, error: deleteError }] = useMutation<
    DeleteBoardCommentResponse
  >(DELETE_BOARD_COMMENT);

  const loading = updateLoading || deleteLoading;
  const error = updateError || deleteError;

  const updateComment = async (
    boardCommentId: string,
    input: UpdateBoardCommentInput,
    password: string,
    boardId: string
  ): Promise<void> => {
    // 유효성 검증
    if (!validateContents(input.contents)) {
      throw new Error("댓글 내용은 1자 이상이어야 합니다.");
    }

    if (!validateRating(input.rating)) {
      throw new Error("평점은 1~5 사이의 숫자여야 합니다.");
    }

    try {
      await updateMutation({
        variables: {
          boardCommentId,
          updateBoardCommentInput: {
            contents: input.contents,
            rating: input.rating,
          },
          password,
        },
        refetchQueries: [
          {
            query: FETCH_BOARD_COMMENTS,
            variables: { boardId, page: 1 },
          },
        ],
      });

      // 성공 시 콜백 실행
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteComment = async (
    boardCommentId: string,
    password: string,
    boardId: string
  ): Promise<void> => {
    try {
      await deleteMutation({
        variables: {
          boardCommentId,
          password,
        },
        refetchQueries: [
          {
            query: FETCH_BOARD_COMMENTS,
            variables: { boardId, page: 1 },
          },
        ],
      });

      // 성공 시 콜백 실행
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    updateComment,
    deleteComment,
    loading,
    error: error || null,
  };
};

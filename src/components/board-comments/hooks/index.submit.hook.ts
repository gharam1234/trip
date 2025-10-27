import { useMutation } from "@apollo/client/react";
import {
  CREATE_BOARD_COMMENT,
  CreateBoardCommentInput,
  CreateBoardCommentResponse,
} from "../graphql/mutations";
import { FETCH_BOARD_COMMENTS } from "../graphql/queries";

/**
 * 댓글 제출 Hook 반환 타입
 */
export interface UseBoardCommentSubmitReturn {
  submitComment: (input: CreateBoardCommentInput, boardId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * 비밀번호 유효성 검증 (4자리 숫자)
 */
const validatePassword = (password: string | undefined): boolean => {
  if (!password) return true; // 비밀번호는 선택사항
  return /^\d{4}$/.test(password);
};

/**
 * 평점 유효성 검증 (1~5)
 */
const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

/**
 * 내용 유효성 검증 (1자 이상)
 */
const validateContents = (contents: string): boolean => {
  return contents.trim().length >= 1;
};

/**
 * 댓글 작성 Hook
 * @param onSuccess - 성공 시 콜백 (폼 초기화 등)
 * @returns submitComment 함수, loading 상태, error 정보
 */
export const useBoardCommentSubmit = (
  onSuccess?: () => void
): UseBoardCommentSubmitReturn => {
  const [createMutation, { loading, error }] = useMutation<
    CreateBoardCommentResponse
  >(CREATE_BOARD_COMMENT);

  const submitComment = async (
    input: CreateBoardCommentInput,
    boardId: string
  ): Promise<void> => {
    // 유효성 검증
    if (!validateContents(input.contents)) {
      throw new Error("댓글 내용은 1자 이상이어야 합니다.");
    }

    if (!validatePassword(input.password)) {
      throw new Error("비밀번호는 4자리 숫자여야 합니다.");
    }

    if (!validateRating(input.rating)) {
      throw new Error("평점은 1~5 사이의 숫자여야 합니다.");
    }

    try {
      await createMutation({
        variables: {
          boardId,
          createBoardCommentInput: {
            writer: input.writer,
            password: input.password,
            contents: input.contents,
            rating: input.rating,
          },
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
    submitComment,
    loading,
    error: error || null,
  };
};

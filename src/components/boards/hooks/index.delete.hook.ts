"use client";

import { useMutation } from '@apollo/client/react';
import { DELETE_BOARD, DeleteBoardResponse, DeleteBoardVariables } from '../graphql/mutations';
import { FETCH_BOARDS, FETCH_BOARD_COUNT } from '../graphql/queries';

/**
 * 게시글 삭제 Hook
 * - Apollo Client useMutation을 사용하여 deleteBoard mutation 호출
 * - 삭제 성공 시 목록을 refetch하여 UI 업데이트
 * - 삭제 확인 대화상자 표시
 */
export function useDeleteBoard() {
  const [deleteBoard, { loading, error }] = useMutation<DeleteBoardResponse, DeleteBoardVariables>(
    DELETE_BOARD,
    {
      // 삭제 성공 시 목록과 총 개수를 refetch하여 UI 업데이트
      refetchQueries: [
        { query: FETCH_BOARDS, variables: { page: 1 } },
        { query: FETCH_BOARD_COUNT }
      ],
      // 캐시 업데이트를 위한 awaitRefetchQueries 옵션
      awaitRefetchQueries: true,
    }
  );

  /**
   * 게시글 삭제 함수
   * @param boardId - 삭제할 게시글 ID
   * @returns 삭제 성공 여부
   */
  const handleDelete = async (boardId: string): Promise<boolean> => {
    try {
      // 삭제 확인 대화상자 표시
      const confirmed = window.confirm('정말로 이 게시글을 삭제하시겠습니까?');

      if (!confirmed) {
        return false;
      }

      // deleteBoard mutation 호출
      await deleteBoard({
        variables: { boardId }
      });

      alert('게시글이 삭제되었습니다.');
      return true;
    } catch (err) {
      // 에러 처리
      const errorMessage = err instanceof Error ? err.message : '게시글 삭제에 실패했습니다.';
      alert(errorMessage);
      return false;
    }
  };

  return {
    handleDelete,
    loading,
    error: error?.message || null
  };
}

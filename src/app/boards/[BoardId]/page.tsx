"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import BoardsDetailWireframe from "@/components/boards-detail";
import BoardComments, { CommentSubmitForm } from "@/components/board-comments";
import { useBoardComments } from "@/components/board-comments/hooks/index.binding.hook";
import { useBoardCommentSubmit } from "@/components/board-comments/hooks/index.submit.hook";
import { useBoardCommentEdit } from "@/components/board-comments/hooks/index.edit.hook";
import { CreateBoardCommentInput, UpdateBoardCommentInput } from "@/components/board-comments/graphql/mutations";

/**
 * 보드 상세 페이지
 * - 와이어프레임 컴포넌트를 연결하여 렌더링
 * - 실제 API 데이터를 기반으로 댓글 목록 렌더링
 */
export default function BoardDetailPage(): JSX.Element {
  const params = useParams();
  const boardId = params?.BoardId as string;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 댓글 데이터 조회
  const { comments, loading, error, refetch } = useBoardComments(boardId, 1);

  // 댓글 제출 Hook
  const { submitComment, loading: isSubmitting, error: submitApiError } = useBoardCommentSubmit(
    () => {
      setSubmitError(null);
      refetch();
    }
  );

  // 댓글 수정/삭제 Hook
  const { updateComment, deleteComment } = useBoardCommentEdit(
    () => {
      setEditError(null);
      setDeleteConfirm(null);
      refetch();
    }
  );

  // 댓글 작성 핸들러
  const handleCommentSubmit = async (
    content: string,
    rating: number,
    author: string,
    password: string
  ) => {
    try {
      setSubmitError(null);
      const input: CreateBoardCommentInput = {
        contents: content,
        rating,
        writer: author,
        password,
      };
      await submitComment(input, boardId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "댓글 작성 실패";
      setSubmitError(errorMessage);
    }
  };

  // 댓글 수정 핸들러
  const handleCommentEdit = async (
    id: string,
    content: string,
    rating: number,
    password: string
  ) => {
    try {
      setEditError(null);
      const input: UpdateBoardCommentInput = {
        contents: content,
        rating,
      };
      await updateComment(id, input, password, boardId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "댓글 수정 실패";
      setEditError(errorMessage);
    }
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = async (id: string, password: string) => {
    try {
      setEditError(null);
      await deleteComment(id, password, boardId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "댓글 삭제 실패";
      setEditError(errorMessage);
    }
  };

  return (
    <>
      <BoardsDetailWireframe />
      <div data-testid="board-detail-container">
        {/* 댓글 작성 폼 */}
        <CommentSubmitForm
          onSubmit={handleCommentSubmit}
          isLoading={isSubmitting}
          error={submitError || (submitApiError?.message ?? undefined)}
        />

        {/* 수정/삭제 에러 메시지 */}
        {editError && (
          <div
            style={{
              color: "red",
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#ffe0e0",
            }}
            data-testid="edit-error-message"
          >
            {editError}
          </div>
        )}

        {/* 댓글 목록 */}
        {loading && <div>댓글을 불러오는 중...</div>}
        {error && <div data-testid="comment-error">댓글을 불러오는 데 실패했습니다.</div>}
        {!loading && comments.length === 0 && (
          <div data-testid="comment-empty">댓글이 없습니다.</div>
        )}
        {comments.map((comment) => (
          <BoardComments
            key={comment.id}
            id={comment.id}
            author={comment.author}
            rating={comment.rating}
            content={comment.content}
            date={comment.date}
            onEdit={handleCommentEdit}
            onDelete={handleCommentDelete}
          />
        ))}
      </div>
    </>
  );
}


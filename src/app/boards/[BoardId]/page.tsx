"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import BoardsDetailWireframe from "@/components/boards-detail";
import BoardComments, { CommentSubmitForm } from "@/components/board-comments";
import { useBoardComments } from "@/components/board-comments/hooks/index.binding.hook";
import { useBoardCommentSubmit } from "@/components/board-comments/hooks/index.submit.hook";
import { CreateBoardCommentInput } from "@/components/board-comments/graphql/mutations";

/**
 * 보드 상세 페이지
 * - 와이어프레임 컴포넌트를 연결하여 렌더링
 * - 실제 API 데이터를 기반으로 댓글 목록 렌더링
 */
export default function BoardDetailPage(): JSX.Element {
  const params = useParams();
  const boardId = params?.BoardId as string;
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 댓글 데이터 조회
  const { comments, loading, error, refetch } = useBoardComments(boardId, currentPage);

  // 댓글 제출 Hook
  const { submitComment, loading: isSubmitting, error: submitApiError } = useBoardCommentSubmit(
    () => {
      setSubmitError(null);
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
  const handleCommentEdit = (id: string, content: string, rating: number) => {
    // TODO: 댓글 수정 로직 구현
    console.log("댓글 수정:", { id, content, rating });
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = (id: string) => {
    // TODO: 댓글 삭제 로직 구현
    console.log("댓글 삭제:", { id });
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


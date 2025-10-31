"use client";

import React from "react";
import { Input } from "@/commons/components/input";
import { Textarea } from "@/commons/components/textarea";
import { Button } from "@/commons/components/button";
import { Modal, useModal } from "@/commons/providers/modal/modal.provider";
import { useBoardComments } from "./hooks/index.binding.hook";
import { useBoardCommentSubmit } from "./hooks/index.submit.hook";
import { useBoardCommentEdit } from "./hooks/index.edit.hook";
import { CreateBoardCommentInput, UpdateBoardCommentInput } from "./graphql/mutations";
import styles from "./styles.module.css";

const RATING_VALUES = [1, 2, 3, 4, 5] as const;
const MAX_CONTENT_LENGTH = 100;

/**
 * 별 아이콘 SVG
 */
function StarIcon({ filled }: { filled: boolean }): JSX.Element {
  return (
    <svg
      className={styles.starIcon}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        d="M12 2.5l2.944 5.961 6.58.957-4.764 4.645 1.125 6.562L12 17.852l-5.885 2.773 1.125-6.562-4.764-4.645 6.58-.957z"
        style={{
          // 수정 이유: 별점 색깔을 노란색(#FADA67)으로 변경
          fill: filled ? "#FADA67" : "var(--color-surface-default)",
          stroke: filled ? "#FADA67" : "var(--color-border-default)",
          strokeWidth: 1,
        }}
      />
    </svg>
  );
}

/**
 * 평점 선택 컴포넌트
 */
interface RatingSelectorProps {
  value: number;
  onChange: (next: number) => void;
  size?: "medium" | "small";
  disabled?: boolean;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  size = "medium",
  disabled,
}) => {
  const handleSelect = React.useCallback(
    (next: number) => {
      if (disabled) return;
      onChange(value === next ? Math.max(next - 1, 0) : next);
    },
    [disabled, onChange, value]
  );

  return (
    <div
      className={`${styles.ratingSelector} ${
        size === "small" ? styles.ratingSelectorSmall : ""
      }`}
      role="radiogroup"
      aria-label="평점 선택"
    >
      {RATING_VALUES.map((rating) => {
        const active = value >= rating;
        return (
          <button
            key={rating}
            type="button"
            aria-label={`${rating}점`}
            aria-pressed={active}
            onClick={() => handleSelect(rating)}
            className={`${styles.ratingButton} ${active ? styles.ratingButtonActive : ""}`}
            disabled={disabled}
          >
            <StarIcon filled={active} />
          </button>
        );
      })}
    </div>
  );
};

/**
 * 평점 표시 컴포넌트
 */
interface RatingDisplayProps {
  value: number;
  size?: "medium" | "small";
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ value, size = "medium" }) => {
  const roundedValue = Math.max(0, Math.min(5, value));

  return (
    <div
      className={`${styles.ratingDisplay} ${
        size === "small" ? styles.ratingDisplaySmall : ""
      }`}
      aria-label={`평점 ${roundedValue.toFixed(1)}점`}
    >
      {RATING_VALUES.map((rating) => {
        const filled = roundedValue >= rating - 0.2;
        return (
          <span key={rating} className={styles.ratingStar} data-testid="comment-rating">
            <StarIcon filled={filled} />
          </span>
        );
      })}
      <span className={styles.ratingNumber}>{roundedValue.toFixed(1)}</span>
    </div>
  );
};

/**
 * 댓글 제출 폼 props 인터페이스
 */
export interface CommentSubmitFormProps {
  onSubmit: (content: string, rating: number, author: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

/**
 * 댓글 제출 폼 컴포넌트
 * 수정 이유: Figma 285:32492 디자인에 맞춰 스타일 조정
 */
export function CommentSubmitForm({
  onSubmit,
  isLoading,
  error,
}: CommentSubmitFormProps): JSX.Element {
  const [author, setAuthor] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [content, setContent] = React.useState("");
  // 수정 이유: 평점 초기값을 3으로 설정
  const [rating, setRating] = React.useState(3);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const remaining = React.useMemo(
    () => Math.max(0, MAX_CONTENT_LENGTH - content.length),
    [content.length]
  );

  const resetForm = React.useCallback(() => {
    setAuthor("");
    setPassword("");
    setContent("");
    // 수정 이유: 폼 리셋 후에도 평점을 초기값 3으로 설정
    setRating(3);
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isLoading) return;

      const trimmedContent = content.trim();
      const trimmedAuthor = author.trim();
      const trimmedPassword = password.trim();

      if (!trimmedContent) {
        setLocalError("댓글 내용을 입력해주세요.");
        return;
      }

      if (rating < 1 || rating > 5) {
        setLocalError("평점을 선택해주세요.");
        return;
      }

      setLocalError(null);

      try {
        await onSubmit(trimmedContent, rating, trimmedAuthor, trimmedPassword);
        resetForm();
      } catch (err) {
        const message = err instanceof Error ? err.message : "댓글 작성에 실패했습니다.";
        setLocalError(message);
      }
    },
    [author, content, isLoading, onSubmit, password, rating, resetForm]
  );

  return (
    <form className={styles.submitForm} data-testid="comment-submit-form" onSubmit={handleSubmit}>
      <div className={styles.submitFormHeader}>
        <h2 className={styles.submitFormTitle}>댓글</h2>
        <div className={styles.submitFormRating}>
          <RatingSelector value={rating} onChange={setRating} />
        </div>
      </div>

      <div className={styles.submitFormRow}>
        <label className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>작성자</span>
          <Input
            variant="primary"
            size="medium"
            className={styles.fullWidth}
            placeholder="이름을 입력해주세요"
            value={author}
            onChange={(event) => setAuthor(event.currentTarget.value)}
            maxLength={50}
            data-testid="comment-author-input"
          />
        </label>

        <label className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>비밀번호</span>
          <Input
            variant="primary"
            size="medium"
            className={styles.fullWidth}
            type="password"
            placeholder="비밀번호를 입력해주세요 (4자이상)"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            maxLength={20}
            data-testid="comment-password-input"
          />
        </label>
      </div>

      <label className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>내용</span>
        <Textarea
          variant="primary"
          size="medium"
          className={styles.fullWidth}
          placeholder="댓글을 입력해주세요."
          value={content}
          onChange={(event) => {
            if (event.currentTarget.value.length <= MAX_CONTENT_LENGTH) {
              setContent(event.currentTarget.value);
            }
          }}
          maxLength={MAX_CONTENT_LENGTH}
          rows={5}
          data-testid="comment-content-input"
          showCount
        />
        {/* <span className={styles.helperText}>{content.length} / {MAX_CONTENT_LENGTH}</span> */}
      </label>

      {(localError || error) && (
        <p className={styles.errorMessage} role="alert" data-testid="comment-submit-error">
          {localError || error}
        </p>
      )}

      <div className={styles.submitFormActions}>
        <Button
          type="submit"
          variant="primary"
          size="medium"
          className={styles.submitButtonNeutral}
          disabled={isLoading || content.trim().length === 0 || rating < 1}
          data-testid="comment-submit-button"
        >
          {isLoading ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}

/**
 * 보드 댓글 props 인터페이스
 */
export interface BoardCommentsProps {
  boardId: string;
}

/**
 * 단일 댓글 카드 props 인터페이스
 */
interface CommentItemProps {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  onEdit?: (id: string, content: string, rating: number, password: string) => Promise<void>;
  onDelete?: (id: string, password: string) => Promise<void>;
}

/**
 * 단일 댓글 카드 컴포넌트
 */
const CommentItem: React.FC<CommentItemProps> = ({
  id,
  author,
  rating,
  content,
  date,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(content);
  const [editRating, setEditRating] = React.useState(rating);
  const [editPassword, setEditPassword] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // 수정 이유: 삭제 시 비밀번호 입력을 모달로 변경하기 위한 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const { openModal, closeModal } = useModal();
  const deleteModalId = React.useMemo(() => `delete-modal-${id}`, [id]);

  React.useEffect(() => {
    if (isDeleteModalOpen) {
      openModal(deleteModalId);
    } else {
      closeModal(deleteModalId);
    }

    return () => {
      closeModal(deleteModalId);
    };
  }, [isDeleteModalOpen, deleteModalId, openModal, closeModal]);

  React.useEffect(() => {
    setEditContent(content);
    setEditRating(rating);
  }, [content, rating]);

  const initials = React.useMemo(() => {
    const safeAuthor = typeof author === "string" ? author : "";
    const trimmed = safeAuthor.trim();
    if (!trimmed) return "?";
    return trimmed.charAt(0).toUpperCase();
  }, [author]);

  const handleToggleEdit = React.useCallback(() => {
    if (!onEdit) return;
    setIsEditing((prev) => !prev);
    setLocalError(null);
    setEditContent(content);
    setEditRating(rating);
    // 수정 이유: 수정 모드 토글 시 비밀번호 초기화
    setEditPassword("");
  }, [content, onEdit, rating]);

  const handleEditSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!onEdit) return;
      if (isSubmitting) return;

      const trimmedContent = editContent.trim();
      const trimmedPassword = editPassword.trim();

      if (!trimmedContent) {
        setLocalError("댓글 내용을 입력해주세요.");
        return;
      }

      if (editRating < 1 || editRating > 5) {
        setLocalError("평점을 선택해주세요.");
        return;
      }

      if (!trimmedPassword) {
        setLocalError("비밀번호를 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      setLocalError(null);

      try {
        await onEdit(id, trimmedContent, editRating, trimmedPassword);
        setIsEditing(false);
        setEditPassword("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "댓글 수정에 실패했습니다.";
        setLocalError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editContent, editPassword, editRating, id, isSubmitting, onEdit]
  );

  // 수정 이유: 삭제 버튼 클릭 시 모달 열기
  const handleDeleteClick = React.useCallback(() => {
    if (!onDelete) return;
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  }, [onDelete]);

  // 수정 이유: 모달에서 삭제 확인 시 실행
  const handleDeleteSubmit = React.useCallback(async () => {
    if (!onDelete) return;
    if (isSubmitting) return;

    const trimmedPassword = deletePassword.trim();
    if (!trimmedPassword) {
      setDeleteError("비밀번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setDeleteError(null);

    try {
      await onDelete(id, trimmedPassword);
      setIsDeleteModalOpen(false);
      setDeletePassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.";
      setDeleteError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [deletePassword, id, isSubmitting, onDelete]);

  // 수정 이유: 모달 닫기
  const handleDeleteCancel = React.useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteError(null);
  }, []);

  return (
    <article
      className={styles.commentCard}
      data-testid="comment-item"
      data-comment-id={id}
    >

      {isEditing ? (
        <form className={styles.editForm} onSubmit={handleEditSubmit} data-testid="comment-edit-form">
          {/* 수정 이유: Figma 285:32565 디자인 반영 + 별점 변경 기능 추가
              - RatingDisplay(읽기 전용)에서 RatingSelector(변경 가능)로 변경
              - 사용자가 별점을 클릭하면 editRating 상태 업데이트 */}
          <div className={styles.editRatingDisplay}>
            <RatingSelector
              value={editRating}
              onChange={setEditRating}
              disabled={isSubmitting}
            />
          </div>

          {/* 수정 이유: Figma 285:32565 디자인 반영 - 작성자/비밀번호를 2열 레이아웃으로 변경 */}
          <div className={styles.editFormRow}>
            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>작성자</span>
              <Input
                variant="primary"
                size="medium"
                className={styles.fullWidth}
                placeholder="작성자"
                value={author}
                disabled
                data-testid="comment-author-display"
              />
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>비밀번호</span>
              <Input
                variant="primary"
                size="medium"
                className={styles.fullWidth}
                type="password"
                placeholder="비밀번호를 입력해 주세요."
                value={editPassword}
                onChange={(event) => setEditPassword(event.currentTarget.value)}
                maxLength={20}
                data-testid="comment-password-input"
              />
            </label>
          </div>

          {/* 수정 이유: Figma 285:32565 디자인 반영 - 내용 입력 필드 */}
          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>내용</span>
            <Textarea
              variant="primary"
              size="medium"
              className={styles.fullWidth}
              value={editContent}
              onChange={(event) => {
                if (event.currentTarget.value.length <= MAX_CONTENT_LENGTH) {
                  setEditContent(event.currentTarget.value);
                }
              }}
              rows={4}
              maxLength={MAX_CONTENT_LENGTH}
              data-testid="comment-edit-content"
              showCount
            />
            {/* <span className={styles.helperText}>{editContent.length} / {MAX_CONTENT_LENGTH}</span> */}
          </label>

          {localError && (
            <p className={styles.errorMessage} role="alert" data-testid="comment-edit-error">
              {localError}
            </p>
          )}

          {/* 수정 이유: Figma 285:32565 디자인 반영 - 버튼 영역을 우측 정렬 */}
          <div className={styles.editFormActions}>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={handleToggleEdit}
              disabled={isSubmitting}
              data-testid="comment-edit-cancel"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              disabled={isSubmitting}
              data-testid="comment-edit-submit"
            >
              {isSubmitting ? "수정 중..." : "수정 하기"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          {/* 수정 이유: Figma 285:32492 디자인에 맞춰 헤더를 재구성
              - 헤더: 프로필/이름/별점(좌측) + 수정/삭제 아이콘(우측) justify-between 배치
              - 내용 및 날짜 순서 유지
              - 비밀번호 필드는 모달이나 별도 영역에서만 표시 */}
          <div className={styles.commentHeaderNew}>
            <div className={styles.commentHeaderLeft}>
              <div className={styles.avatarSmall} aria-hidden>
                <span className={styles.avatarInitialSmall}>{initials}</span>
              </div>
              <div className={styles.commentMeta}>
                <span className={styles.commentAuthorSmall} data-testid="comment-author">
                  {author || "익명"}
                </span>
                <RatingDisplay value={rating} size="small" />
              </div>
            </div>
            {(onEdit || onDelete) && (
              <div className={styles.commentActionIcons}>
                {onEdit && (
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={handleToggleEdit}
                    disabled={isSubmitting}
                    aria-label="댓글 수정"
                    data-testid="comment-edit-button"
                  >
                    {/* 수정 이유: @03-ui.mdc 규칙 - public/icons/edit.png 사용 */}
                    <img
                      src="/icons/edit.png"
                      alt="수정"
                      width="20"
                      height="20"
                    />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={handleDeleteClick}
                    disabled={isSubmitting}
                    aria-label="댓글 삭제"
                    data-testid="comment-delete-button"
                  >
                    {/* 수정 이유: @03-ui.mdc 규칙 - public/icons/delete.png 사용 */}
                    <img
                      src="/icons/delete.png"
                      alt="삭제"
                      width="20"
                      height="20"
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          <p className={styles.commentContent} data-testid="comment-content">
            {content}
          </p>

          <div className={styles.commentFooter}>
            <span className={styles.commentDate} data-testid="comment-date">
              {date}
            </span>
          </div>

          {/* 수정 이유: 삭제 모달 컴포넌트 및 수정 시 비밀번호는 editForm 내에서만 처리 */}
          {onDelete && (
            <Modal
              id={`delete-modal-${id}`}
              isOpen={isDeleteModalOpen}
              onClose={handleDeleteCancel}
              data-testid="comment-delete-modal"
            >
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>댓글 삭제</h3>
                <p className={styles.modalMessage}>댓글을 삭제하시려면 비밀번호를 입력해주세요.</p>

                <label className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>비밀번호</span>
                  <Input
                    variant="primary"
                    size="medium"
                    className={styles.fullWidth}
                    type="password"
                    placeholder="비밀번호를 입력해주세요."
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.currentTarget.value)}
                    maxLength={20}
                    data-testid="comment-delete-password-input"
                  />
                </label>

                {deleteError && (
                  <p className={styles.errorMessage} role="alert" data-testid="comment-delete-error">
                    {deleteError}
                  </p>
                )}

                <div className={styles.modalActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={handleDeleteCancel}
                    disabled={isSubmitting}
                    data-testid="comment-delete-cancel"
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="medium"
                    onClick={handleDeleteSubmit}
                    disabled={isSubmitting}
                    data-testid="comment-delete-confirm"
                  >
                    {isSubmitting ? "삭제 중..." : "삭제 하기"}
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </article>
  );
};

/**
 * 댓글 섹션 와이어프레임
 * 수정 이유: prompt.101.wireframe.txt의 정확한 크기와 gap 요구사항 반영
 * - 댓글 작성 폼 섹션 (1280px 너비)
 * - 댓글 목록 섹션 (1200px 너비)
 */
function BoardCommentsWireframe(): JSX.Element {
  return (
    <section className={styles.wireframeWrapper} data-testid="board-comments">
      {/* 댓글 작성 폼 섹션: 1280 × auto */}
      <div className={styles.wireframeFormSection}>
        {/* re-title: 1280 × 24 */}
        <div className={styles.wireframeTitle} />

        {/* gap: 24 */}

        {/* re-rating: 1280 × 24 */}
        <div className={styles.wireframeRating} />

        {/* gap: 24 */}

        {/* re-input: 1280 × 144 */}
        <div className={styles.wireframeInput} />

        {/* gap: 16 */}

        {/* re-footer: 1280 × 48 */}
        <div className={styles.wireframeFooter} />
      </div>

      {/* gap: 40 (댓글 폼과 목록 사이) */}

      {/* 댓글 목록 섹션: 1200 × auto */}
      <div className={styles.wireframeListSection}>
        {/* gap: 24 (상단) */}

        {/* comment-list: 1200 × auto */}
        <div className={styles.wireframeList}>
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.wireframeComment} />
          ))}
          {/* gap: 12 (item들 사이에 자동 적용) */}
        </div>

        {/* gap: 40 (하단) */}
      </div>
    </section>
  );
}

/**
 * 보드 댓글 컴포넌트
 * - boardId를 받아 실제 API 데이터를 가져와 댓글 목록 렌더링
 * - 로딩 중일 때는 와이어프레임 표시
 * - 댓글이 없으면 빈 상태 표시
 */
export default function BoardComments({ boardId }: BoardCommentsProps): JSX.Element {
  // 수정 이유: useBoardComments 훅을 사용하여 실제 API 데이터 바인딩
  const { comments, loading, error, refetch } = useBoardComments(boardId);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [editError, setEditError] = React.useState<string | null>(null);

  const {
    submitComment,
    loading: isSubmitting,
    error: submitApiError,
  } = useBoardCommentSubmit(() => {
    setSubmitError(null);
    void refetch();
  });

  const {
    updateComment,
    deleteComment,
    error: editApiError,
  } = useBoardCommentEdit(() => {
    setEditError(null);
    void refetch();
  });

  const handleCommentSubmit = React.useCallback<CommentSubmitFormProps["onSubmit"]>(
    async (content, rating, author, password) => {
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
        const message =
          err instanceof Error ? err.message : "댓글 작성에 실패했습니다.";
        setSubmitError(message);
        throw new Error(message);
      }
    },
    [boardId, submitComment]
  );

  const handleCommentEdit = React.useCallback<
    NonNullable<CommentItemProps["onEdit"]>
  >(
    async (id, content, rating, password) => {
      try {
        setEditError(null);
        const input: UpdateBoardCommentInput = {
          contents: content,
          rating,
        };
        await updateComment(id, input, password, boardId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "댓글 수정에 실패했습니다.";
        setEditError(message);
        throw new Error(message);
      }
    },
    [boardId, updateComment]
  );

  const handleCommentDelete = React.useCallback<
    NonNullable<CommentItemProps["onDelete"]>
  >(
    async (id, password) => {
      try {
        setEditError(null);
        await deleteComment(id, password, boardId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.";
        setEditError(message);
        throw new Error(message);
      }
    },
    [boardId, deleteComment]
  );

  // 로딩 중이면 와이어프레임 표시
  if (loading) {
    return <BoardCommentsWireframe />;
  }

  // 댓글 목록을 렌더링하는 섹션
  return (
    <section className={styles.wireframeWrapper} data-testid="board-comments">
      {/* 댓글 작성 폼 섹션 */}
      <div className={styles.wireframeFormSection}>
        <CommentSubmitForm
          onSubmit={handleCommentSubmit}
          isLoading={isSubmitting}
          error={submitError || submitApiError?.message || undefined}
        />
      </div>

      {/* gap: 40 (댓글 폼과 목록 사이) */}

      {/* 댓글 목록 섹션 */}
      <div className={styles.wireframeListSection}>
        {(error || editError || editApiError) && (
          <div
            className={styles.errorMessage}
            role="alert"
            style={{ marginBottom: "16px" }}
            data-testid="comment-edit-error"
          >
            {editError || editApiError?.message || error?.message}
          </div>
        )}
        {comments.length > 0 ? (
          <div className={styles.wireframeList}>
            {comments.map((comment: any) => (
              <CommentItem
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
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--color-text-quaternary)",
            }}
            data-testid="comment-empty"
          >
            댓글이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}

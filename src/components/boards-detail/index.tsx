"use client";

import React from "react";
import BoardComments from "@/components/board-comments";
import { useParams } from "next/navigation";
import styles from "./styles.module.css";
import Button from "@/commons/components/button";
import { useBoardDetailBinding } from "./hooks/index.binding.hook";
import { useBoardEditLink } from "./hooks/index.link.update.hook";
import { useBoardListLink } from "./hooks/index.link.boards.hook";
import { useTooltip } from "./hooks/index.tooltip.hook";
import { useLikeDislikeCounts } from "./hooks/index.like-dislike.binding.hook";
import { useLikeDislikeFunction } from "./hooks/index.like-dislike.function.hook";
import { formatBoardDate } from "@/commons/utils/date";

/**
 * 보드 상세 페이지 컴포넌트
 * - Figma 디자인을 반영하여 UI 구현
 * - HTML과 flexbox만 사용하여 구조 구성
 * - 고정 폭 1280px 기준 섹션 높이/간격을 요구사항 수치로 맞춤
 * - 실제 데이터를 바인딩하여 표시
 *
 * 포함 영역:
 * - detail-title: 제목 (28px, Bold)
 * - detail-writer: 작성자 정보 (프로필, 날짜, 위치 아이콘, 툴팁)
 * - detail-images: 대표 이미지 (1280 × 531px)
 * - detail-content: 본문 내용 (16px, Regular)
 * - detail-video: 비디오 영역 (1280 × 508px)
 * - detail-icon: 반응 아이콘 (좋아요/싫어요 카운트)
 * - detail-footer: 버튼 영역 (목록으로, 수정하기)
 */
export default function BoardsDetailWireframe(): JSX.Element {
  // URL 파라미터에서 boardId 추출
  const params = useParams();
  const boardId = params?.BoardId as string;

  // 실제 데이터 바인딩 훅 사용
  const { boardData, loading, error } = useBoardDetailBinding(boardId);
  // 좋아요/싫어요 카운트 훅 사용
  const { likeCount, dislikeCount } = useLikeDislikeCounts(boardData);
  const { handleLike, handleDislike, isLiking, isDisliking } =
    useLikeDislikeFunction();
  // 게시글 수정 페이지 이동 훅 사용
  const { navigateToEdit } = useBoardEditLink();
  // 게시글 목록 페이지 이동 훅 사용
  const { navigateToList } = useBoardListLink();

  // 툴팁 기능 훅 사용
  const { tooltipState, handleMouseEnter, handleMouseLeave, getTooltipMessage } = useTooltip();

  // 수정 버튼 클릭 처리: 게시글 수정 페이지로 이동
  const handleEditClick = React.useCallback(() => {
    if (boardId) {
      navigateToEdit(boardId);
    }
  }, [boardId, navigateToEdit]);

  // 목록으로 버튼 클릭 처리: 게시글 목록 페이지로 이동
  const handleListClick = React.useCallback(() => {
    navigateToList();
  }, [navigateToList]);

  const handleLikeClick = React.useCallback(() => {
    if (!boardId || isLiking) return;
    void handleLike(boardId);
  }, [boardId, handleLike, isLiking]);

  const handleDislikeClick = React.useCallback(() => {
    if (!boardId || isDisliking) return;
    void handleDislike(boardId);
  }, [boardId, handleDislike, isDisliking]);

  const handleLikeKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleLikeClick();
      }
    },
    [handleLikeClick]
  );

  const handleDislikeKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleDislikeClick();
      }
    },
    [handleDislikeClick]
  );

  // 로딩 상태 처리
  const renderContent = (content: React.ReactNode) => (
    <div className={styles.container} data-testid="boards-detail-page">
      <div data-testid="board-detail-page" className={styles.detailContentWrapper}>
        {content}
      </div>
    </div>
  );

  if (loading) {
    return renderContent(<div>로딩 중...</div>);
  }

  if (error) {
    return renderContent(<div>오류가 발생했습니다: {error}</div>);
  }

  const formattedCreatedAt = boardData?.createdAt
    ? formatBoardDate(boardData.createdAt)
    : "";

  if (!boardData) {
    return renderContent(<div>게시글을 찾을 수 없습니다.</div>);
  }

  return renderContent(
    <>
      {/* 제목 영역: 실제 데이터 바인딩 */}
      <section className={styles.detailTitle}>
        <h1 className={styles.titleText}>{boardData.title}</h1>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 작성자 영역: 실제 데이터 바인딩 */}
      <section className={styles.detailWriter}>
        <div className={styles.writerRowTop}>
          <div className={styles.writerProfile}>
            <div className={styles.profileImage} aria-hidden />
            <span className={styles.profileName}>{boardData.writer}</span>
          </div>
          <div className={styles.writerMeta}>
            <span className={styles.writerDate}>{formattedCreatedAt}</span>
          </div>
        </div>
        <div className={styles.writerDivider} />
        <div className={styles.writerRowBottom}>
          <div className={styles.iconLink} aria-label="링크 아이콘" />
          <div
            className={styles.iconLocation}
            data-testid="icon-location"
            aria-label={`위치: ${boardData.boardAddress?.address || '위치 정보 없음'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          {/* 툴팁 표시 */}
          {tooltipState.isVisible && (
            <div
              className={`${styles.tooltip} ${styles.tooltipVisible}`}
              data-testid="tooltip"
              style={{
                left: `${tooltipState.position.x}px`,
                top: `${tooltipState.position.y}px`,
              }}
            >
              {getTooltipMessage(boardData.boardAddress?.address)}
            </div>
          )}
        </div>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 이미지 영역: 실제 이미지 데이터 바인딩 */}
      <section className={styles.detailImages}>
        {boardData.images && boardData.images.length > 0 ? (
          <div className={styles.heroImage} style={{ backgroundImage: `url(${boardData.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div className={styles.heroImage} />
        )}
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 내용 영역: 실제 내용 데이터 바인딩 */}
      <section className={styles.detailContent}>
        {boardData.contents.split('\n').map((paragraph, index) => (
          <p key={index} className={styles.contentParagraph}>
            {paragraph}
          </p>
        ))}
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 비디오 영역: 실제 유튜브 URL 바인딩 */}
      <section className={styles.detailVideo}>
        {boardData.youtubeUrl ? (
          <div className={styles.videoThumb}>
            <button 
              className={styles.playButton} 
              aria-label="재생"
              onClick={() => window.open(boardData.youtubeUrl, '_blank')}
            >
              <span className={styles.playTriangle} aria-hidden />
            </button>
          </div>
        ) : (
          <div className={styles.videoThumb}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              비디오가 없습니다
            </div>
          </div>
        )}
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 아이콘 영역: 싫어요/좋아요 카운트 */}
      {/* 수정 이유: useLikeDislikeCounts 훅을 사용하여 GraphQL API에서 받은 실제 likeCount, dislikeCount 데이터를 바인딩 */}
      <section className={styles.detailIcon}>
        <div
          className={styles.reactionBad}
          role="button"
          tabIndex={0}
          aria-label="싫어요"
          aria-disabled={isDisliking}
          onClick={handleDislikeClick}
          onKeyDown={handleDislikeKeyDown}
          data-loading={isDisliking ? "true" : undefined}
        >
          <span className={styles.iconBad} aria-hidden />
          <span className={styles.reactionCountMuted}>{dislikeCount}</span>
        </div>
        <div
          className={styles.reactionGood}
          role="button"
          tabIndex={0}
          aria-label="좋아요"
          aria-disabled={isLiking}
          onClick={handleLikeClick}
          onKeyDown={handleLikeKeyDown}
          data-loading={isLiking ? "true" : undefined}
        >
          <span className={styles.reactionCountDanger}>{likeCount}</span>
          <span className={styles.iconGood} aria-hidden />
        </div>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 푸터 영역: 버튼 2개 */}
      <section className={styles.detailFooter}>
        <Button 
          variant="secondary" 
          size="small" 
          onClick={handleListClick}
          data-testid="list-button"
        >
          목록으로
        </Button>
        <div
          className={styles.detailFooterButtonWrapper}
          data-testid="board-edit-button"
          onClick={handleEditClick}
        >
          <Button
            variant="secondary"
            size="small"
            data-testid="edit-button"
          >
            수정하기
          </Button>
        </div>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* gap 40 */}
      <div className={styles.gap40} />

      {/* 댓글 섹션 */}
      {/* 수정 이유: boardId를 props로 전달하여 실제 댓글 데이터 바인딩 */}
      <BoardComments boardId={boardId} />
    </>
  );
}

// === 변경 주석 ===
// 시각: 2025-10-30 UI 구현 작업
// 변경 이유: Figma 디자인을 반영하여 보드 상세 페이지 UI 완성
// 작업 내용:
//   1. 와이어프레임 기본 구조 유지
//   2. 각 섹션의 타이포그래피 토큰 정확히 적용
//   3. 색상 토큰 사용 (하드코딩 제거)
//   4. Flexbox 기반 레이아웃으로 구성
//   5. board-comments 컴포넌트 완전히 분리

"use client";

import React from "react";
import { useParams } from "next/navigation";
import styles from "./styles.module.css";
import Button from "@/commons/components/button";
import Textarea from "@/commons/components/textarea";
import { useBoardDetailBinding } from "./hooks/index.binding.hook";
import { useBoardEditLink } from "./hooks/index.link.update.hook";
import { useBoardListLink } from "./hooks/index.link.boards.hook";
import { useTooltip } from "./hooks/index.tooltip.hook";
import { formatBoardDate } from "@/commons/utils/date";

/**
 * 보드 상세 와이어프레임 컴포넌트
 * - HTML과 flexbox만 사용하여 구조를 구현
 * - 고정 폭 1280px 기준 섹션 높이/간격을 요구사항 수치로 맞춤
 * - 실제 로컬스토리지 데이터를 바인딩하여 표시
 */
export default function BoardsDetailWireframe(): JSX.Element {
  // URL 파라미터에서 boardId 추출
  const params = useParams();
  const boardId = params?.BoardId as string;

  // 실제 데이터 바인딩 훅 사용
  const { boardData, loading, error } = useBoardDetailBinding(boardId);
  // 게시글 수정 페이지 이동 훅 사용
  const { navigateToEdit } = useBoardEditLink();
  // 게시글 목록 페이지 이동 훅 사용
  const { navigateToList } = useBoardListLink();
  // 별점/댓글 입력 상태 관리 (주석은 항상 한국어)
  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState<string>("");
  
  // 툴팁 기능 훅 사용
  const { tooltipState, handleMouseEnter, handleMouseLeave, getTooltipMessage } = useTooltip();

  // 등록 버튼 클릭 처리: 현재는 콘솔 출력만 수행
  const handleSubmit = React.useCallback(() => {
    // 실제 연동 시 서버 호출로 교체
    console.log("submit review", { rating, commentLength: comment.length, comment });
  }, [rating, comment]);

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
      <section className={styles.detailIcon}>
        <div className={styles.reactionBad}>
          <span className={styles.iconBad} aria-hidden />
          <span className={styles.reactionCountMuted}>24</span>
        </div>
        <div className={styles.reactionGood}>
          <span className={styles.reactionCountDanger}>12</span>
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

      {/* 회고 타이틀 (re-title) */}
      <section className={styles.reTitle}>
        <h2 className={styles.reTitleText}>댓글</h2>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 평점 (re-rating) */}
      <section className={styles.reRating}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value}점`}
            aria-pressed={value <= rating}
            className={value <= rating ? styles.ratingItemActive : styles.ratingItem}
            onClick={() => setRating(value)}
          >
            {value <= rating ? "★" : "☆"}
          </button>
        ))}
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 입력 (re-input) */}
      <section className={styles.reInput}>
        <Textarea
          className={styles.reTextareaRoot}
          textareaClassName={styles.reTextareaEl}
          placeholder="댓글을 입력하세요"
          maxLength={200}
          showCount
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </section>

      {/* gap 16 */}
      <div className={styles.gap16} />

      {/* 회고 푸터 (re-footer) */}
      <section className={styles.reFooter}>
        <Button size="small" disabled={rating === 0 || comment.trim().length === 0} onClick={handleSubmit}>등록</Button>
      </section>

      {/* gap 40 */}
      <div className={styles.gap40} />

      {/* 리스트 타이틀 (re-list) */}
      <section className={styles.reList}>
        <h3 className={styles.reListText}>댓글 목록</h3>
      </section>

      {/* gap 40 */}
      <div className={styles.gap40} />

      {/* gap 40 */}
      <div className={styles.gap40} />
    </>
  );
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


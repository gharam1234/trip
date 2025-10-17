"use client";

import React from "react";
import styles from "./styles.module.css";
import Button from "@/commons/components/button";
import Textarea from "@/commons/components/textarea";

/**
 * 보드 상세 와이어프레임 컴포넌트
 * - HTML과 flexbox만 사용하여 구조를 구현
 * - 고정 폭 1280px 기준 섹션 높이/간격을 요구사항 수치로 맞춤
 */
export default function BoardsDetailWireframe(): JSX.Element {
  // 별점/댓글 입력 상태 관리 (주석은 항상 한국어)
  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState<string>("");

  // 등록 버튼 클릭 처리: 현재는 콘솔 출력만 수행
  const handleSubmit = React.useCallback(() => {
    // 실제 연동 시 서버 호출로 교체
    console.log("submit review", { rating, commentLength: comment.length, comment });
  }, [rating, comment]);
  return (
    <div className={styles.container}>
      {/* 제목 영역: 피그마 타이틀 포맷 반영 */}
      <section className={styles.detailTitle}>
        <h1 className={styles.titleText}>살어리 살어리랏다 쳥산(靑山)애 살어리랏다멀위랑 ᄃᆞ래랑 먹고 쳥산(靑山)애 살어리랏다얄리얄리 얄랑셩 얄라리 얄라</h1>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 작성자 영역: 프로필, 작성일, 구분선, 링크/위치 아이콘 자리표시 */}
      <section className={styles.detailWriter}>
        <div className={styles.writerRowTop}>
          <div className={styles.writerProfile}>
            <div className={styles.profileImage} aria-hidden />
            <span className={styles.profileName}>홍길동</span>
          </div>
          <div className={styles.writerMeta}>
            <span className={styles.writerDate}>2024.11.11</span>
          </div>
        </div>
        <div className={styles.writerDivider} />
        <div className={styles.writerRowBottom}>
          <div className={styles.iconLink} aria-label="링크 아이콘" />
          <div className={styles.iconLocation} aria-label="위치 아이콘" />
        </div>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 이미지 영역: 대표 이미지 자리표시 */}
      <section className={styles.detailImages}>
        <div className={styles.heroImage} />
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 내용 영역: 본문 타이포 */}
      <section className={styles.detailContent}>
        <p className={styles.contentParagraph}>
          살겠노라 살겠노라. 청산에 살겠노라. 머루랑 다래를 먹고 청산에 살겠노라. 얄리얄리 얄랑셩 얄라리 얄라
        </p>
        <p className={styles.contentParagraph}>
          우는구나 우는구나 새야. 자고 일어나 우는구나 새야. 너보다 시름 많은 나도 자고 일어나 우노라. 얄리얄리 얄라셩 얄라리 얄라
        </p>
        <p className={styles.contentParagraph}>
          갈던 밭 보았느냐. 물 아래 갈던 밭 보았느냐. 이끼 묻은 쟁기를 가지고 물 아래 갈던 밭 보았느냐.
        </p>
      </section>

      {/* gap 24 */}
      <div className={styles.gap24} />

      {/* 비디오 영역: 썸네일 + 플레이 버튼 자리표시 */}
      <section className={styles.detailVideo}>
        <div className={styles.videoThumb}>
          <button className={styles.playButton} aria-label="재생">
            <span className={styles.playTriangle} aria-hidden />
          </button>
        </div>
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
        <Button variant="secondary" size="small">목록으로</Button>
        <Button variant="secondary" size="small">수정하기</Button>
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
    </div>
  );
}



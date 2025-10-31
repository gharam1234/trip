'use client';

// mainCard 컴포넌트: 오늘 핫한 트립토크 섹션
// - 카드 레이아웃: 4개의 트립토크 카드를 flex로 배치
// - 각 카드: 이미지, 제목, 작성자, 좋아요, 날짜
// - FetchBoards API에서 실제 데이터를 가져와서 likeCount 기준으로 정렬하여 상위 4개만 표시
// 수정 이유: 하드코딩된 MOCK 데이터를 제거하고 useMainCardBinding 훅을 통해 실제 FetchBoards API 데이터를 바인딩하도록 변경

import React from 'react';
import styles from './styles.module.css';
import {
  useMainCardBinding,
  MainCardItem,
  DEFAULT_CARD_IMAGE
} from './hooks/index.binding.hook';
import { useMainCardRouting } from './hooks/index.routing.hook';

// 카드 컴포넌트
interface CardProps {
  data: MainCardItem;
}

function Card({ data }: CardProps): JSX.Element {
  // 라우팅 훅을 사용하여 카드 클릭 이벤트 처리
  const { handleCardClick } = useMainCardRouting();
  const handleImageError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // 이미지 로딩 실패 시 샘플 이미지로 대체
      event.currentTarget.onerror = null;
      event.currentTarget.src = DEFAULT_CARD_IMAGE;
    },
    []
  );

  // 수정 이유: 카드 클릭 시 해당 게시글 상세 페이지로 이동하는 기능 추가
  const handleClick = () => {
    handleCardClick(data.id);
  };

  return (
    <div className={styles.card} data-testid={`maincard-card-${data.id}`} onClick={handleClick}>
      <img
        src={data.imageUrl}
        alt={data.title}
        className={styles.cardImg}
        data-testid={`maincard-card-img-${data.id}`}
        onError={handleImageError}
      />
      <div className={styles.cardContent}>
        <p className={styles.cardTitle} data-testid={`maincard-card-title-${data.id}`}>
          {data.title}
        </p>
        <div className={styles.cardProfile} data-testid={`maincard-card-profile-${data.id}`}>
          <img
            src={data.authorImage}
            alt={data.authorName}
            className={styles.cardProfileImg}
          />
          <p className={styles.cardProfileName}>{data.authorName}</p>
        </div>
        <div className={styles.cardBottom}>
          <div className={styles.cardLikeArea} data-testid={`maincard-card-like-${data.id}`}>
            <svg
              className={styles.cardLikeIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
                style={{ color: '#f66a6a' }}
              />
            </svg>
            <p className={styles.cardLikeCount}>{data.likeCount}</p>
          </div>
          <p className={styles.cardDate}>{data.date}</p>
        </div>
      </div>
    </div>
  );
}

// MainCard 메인 컴포넌트
export default function MainCard(): JSX.Element {
  // useMainCardBinding 훅으로 FetchBoards API 데이터 가져오기
  const { cards } = useMainCardBinding();

  return (
    <div className={styles.container} data-testid="maincard-container">
      <h2 className={styles.title} data-testid="maincard-title">
        오늘 핫한 트립토크
      </h2>
      <div className={styles.cardArea} data-testid="maincard-cards-wrapper">
        {cards.map((card) => (
          <Card key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}

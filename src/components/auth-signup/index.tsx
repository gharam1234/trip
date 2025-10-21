'use client';

import React from 'react';
import { Input } from '@/commons/components/input';
import { Button } from '@/commons/components/button';
import styles from './styles.module.css';

export default function AuthSignup() {
  // 회원가입 UI 컴포넌트 (피그마 스펙 기반)
  // - header 영역: "회원가입" 텍스트 (18px, SemiBold, 중앙 정렬)
  // - title 영역: "회원가입을 위해 아래 빈칸을 모두 채워 주세요." (14px, Medium, 중앙 정렬)
  // - form 영역: 공통 <Input /> 적용 (size: small, variant: primary) × 4개
  // - button 영역: 회원가입 <Button /> (variant: primary, size: medium, width: 320px)
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftSide}>
        {/* 상단 갭 */}
        <div className={styles.leftGapTop} />
        
        {/* 헤더 영역: "회원가입" */}
        <header className={styles.header}>
          <h1 className={styles.headerText}>회원가입</h1>
        </header>

        {/* 헤더-타이틀 갭 */}
        <div className={styles.gapHeaderToTitle} />

        {/* 타이틀 영역: "회원가입을 위해 아래 빈칸을 모두 채워 주세요." */}
        <div className={styles.title}>
          <p className={styles.titleText}>회원가입을 위해 아래 빈칸을 모두 채워 주세요.</p>
        </div>

        {/* 타이틀-폼 갭 */}
        <div className={styles.gapTitleToForm} />

        {/* 폼 영역: 4개 Input 필드 */}
        <form className={styles.form}>
          {/* 이메일 입력 */}
          <div className={styles.formRow}>
            <Input
              variant="primary"
              size="small"
              label="이메일"
              placeholder="이메일을 입력해 주세요."
              type="email"
              required
              className={styles.width320}
            />
          </div>

          {/* 이름 입력 */}
          <div className={styles.formRow}>
            <Input
              variant="primary"
              size="small"
              label="이름"
              placeholder="이름을 입력해 주세요."
              type="text"
              required
              className={styles.width320}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className={styles.formRow}>
            <Input
              variant="primary"
              size="small"
              label="비밀번호"
              placeholder="비밀번호를 입력해 주세요."
              type="password"
              required
              className={styles.width320}
            />
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className={styles.formRow}>
            <Input
              variant="primary"
              size="small"
              label="비밀번호 확인"
              placeholder="비밀번호를 한번 더 입력해 주세요."
              type="password"
              required
              className={styles.width320}
            />
          </div>
        </form>

        {/* 폼-버튼 갭 */}
        <div className={styles.gapFormToButton} />

        {/* 버튼 영역: 회원가입 버튼 */}
        <div className={styles.buttonArea}>
          <Button
            variant="primary"
            size="medium"
            className={styles.width320}
            type="button"
          >
            회원가입
          </Button>
        </div>

        {/* 하단 갭 */}
        <div className={styles.leftGapBottom} />
      </div>

      {/* 오른쪽 영역 (배경) */}
      <div className={styles.rightSide} />
    </div>
  );
}

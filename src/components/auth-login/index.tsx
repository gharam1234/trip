'use client';
import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import { Input } from '@/commons/components/input';
import { Button } from '@/commons/components/button';
import Image from 'next/image';

export default function AuthLogin() {
  // 로그인 UI 컴포넌트 (피그마 스펙 기반)
  // - title 영역: 로고와 환영 메시지 (공통 컴포넌트 없음)
  // - form 영역: 공통 <Input /> 적용 (size: small, variant: primary)
  // - button 영역: 로그인 <Button /> + 회원가입 링크 버튼
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftSide}>
        <div className={styles.leftGapTop} />
        <h1 className={styles.title}>
          <Image src="/images/logo.png" alt="logo" width={120} height={80} />
          
          <span className={styles.titleText}>트립트립에 오신걸 환영합니다</span>
        </h1>
        <div className={styles.leftGapMid1} /><div>
        </div>
        <div className={styles.leftGapMid3}>트립트립에 로그인 하세요</div>
        <div className={styles.leftGapMid1} />
        <form className={styles.form}>
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
        </form>
        <div className={styles.leftGapMid2} />
        <div className={styles.buttonArea}>
          <Button
            variant="primary"
            size="medium"
            className={styles.width320}
            type="button"
          >
            로그인
          </Button>
          <Link className={styles.linkButton} href='/auth/signup' aria-label='회원가입 페이지로 이동'>
            회원가입
          </Link>
        </div>
        <div className={styles.leftGapBottom} />
      </div>
      <div className={styles.rightSide} />
    </div>
  );
}



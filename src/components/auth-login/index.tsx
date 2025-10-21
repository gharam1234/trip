'use client';

// React 관련
import React from 'react';

// Next.js 관련
import Link from 'next/link';
import Image from 'next/image';

// 내부 컴포넌트/훅
import { Input } from '@/commons/components/input';
import { Button } from '@/commons/components/button';
import { Modal, useModal } from '@/commons/providers/modal/modal.provider';
import { useLoginForm } from './hooks/index.form.hook';

// 스타일
import styles from './styles.module.css';

export default function AuthLogin() {
  const { form, handleLogin, handleModalConfirm, loginLoading } = useLoginForm();
  const { isModalOpen } = useModal();

  /**
   * 폼 제출 처리
   * @param data - 폼 데이터 (email, password)
   */
  const onSubmit = (data: { email: string; password: string }) => {
    handleLogin(data);
  };

  return (
    <div className={styles.wrapper} data-testid="login-container">
      <div className={styles.leftSide}>
        <div className={styles.leftGapTop} />
        <h1 className={styles.title}>
          <Image src="/images/logo.png" alt="logo" width={120} height={80} />
          <span className={styles.titleText}>트립트립에 오신걸 환영합니다</span>
        </h1>
        <div className={styles.leftGapMid1} />
        <div className={styles.leftGapMid3}>트립트립에 로그인 하세요</div>
        <div className={styles.leftGapMid1} />
        <form className={styles.form} data-testid="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className={styles.formRow}>
            <Input
              variant="primary"
              size="small"
              type="email"
              required
              label="이메일"
              placeholder="이메일을 입력해 주세요."
              className={styles.width320}
              value={form.watch('email') || ''}
              onChange={(e) => form.setValue('email', e.target.value)}
              onBlur={() => form.trigger('email')}
              data-testid="email-input"
            />
            {form.formState.errors.email && (
              <div data-testid="email-error" className={styles.errorMessage}>
                {form.formState.errors.email.message}
              </div>
            )}
          </div>
          <div className={styles.formRow}>
            <Input
              variant="primary"
              size="small"
              type="password"
              required
              label="비밀번호"
              placeholder="비밀번호를 입력해 주세요."
              className={styles.width320}
              value={form.watch('password') || ''}
              onChange={(e) => form.setValue('password', e.target.value)}
              onBlur={() => form.trigger('password')}
              data-testid="password-input"
            />
            {form.formState.errors.password && (
              <div data-testid="password-error" className={styles.errorMessage}>
                {form.formState.errors.password.message}
              </div>
            )}
          </div>
          <div className={styles.leftGapMid2} />
          <div className={styles.buttonArea}>
            <Button
              variant="primary"
              size="medium"
              type="submit"
              className={styles.width320}
              disabled={loginLoading}
              data-testid="login-button"
            >
              {loginLoading ? '로그인 중...' : '로그인'}
            </Button>
            <Link
              className={styles.linkButton}
              href="/auth/signup"
              aria-label="회원가입 페이지로 이동"
            >
              회원가입
            </Link>
          </div>
        </form>
        <div className={styles.leftGapBottom} />
      </div>
      <div className={styles.rightSide} />

      {/* 로그인완료모달 */}
      <Modal
        id="login-success-modal"
        isOpen={isModalOpen('login-success-modal')}
        onClose={handleModalConfirm}
        variant="info"
        actions="single"
      >
        <div data-testid="login-success-modal">
          <h3>로그인 완료</h3>
          <p>로그인이 성공적으로 완료되었습니다.</p>
          <button
            data-testid="modal-confirm-button"
            onClick={handleModalConfirm}
          >
            완료
          </button>
        </div>
      </Modal>

      {/* 로그인실패모달 */}
      <Modal
        id="login-fail-modal"
        isOpen={isModalOpen('login-fail-modal')}
        onClose={handleModalConfirm}
        variant="danger"
        actions="single"
      >
        <div data-testid="login-fail-modal">
          <h3>로그인 실패</h3>
          <p>이메일 또는 비밀번호가 올바르지 않습니다.</p>
          <button
            data-testid="modal-confirm-button"
            onClick={handleModalConfirm}
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
}

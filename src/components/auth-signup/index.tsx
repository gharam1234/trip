'use client';

import React from 'react';
import { Input } from '@/commons/components/input';
import { Button } from '@/commons/components/button';
import { Modal } from '@/commons/providers/modal/modal.provider';
import { Modal as ModalComponent } from '@/commons/components/modal';
import styles from './styles.module.css';
import { useSignupForm } from './hooks/index.form.hook';

export default function AuthSignup() {
  // 회원가입 UI 컴포넌트 (피그마 스펙 기반)
  // - header 영역: "회원가입" 텍스트 (18px, SemiBold, 중앙 정렬)
  // - title 영역: "회원가입을 위해 아래 빈칸을 모두 채워 주세요." (14px, Medium, 중앙 정렬)
  // - form 영역: 공통 <Input /> 적용 (size: small, variant: primary) × 4개
  // - button 영역: 회원가입 <Button /> (variant: primary, size: medium, width: 320px)
  
  const {
    onSubmit,
    isSubmitting,
    showSuccessModal,
    showFailureModal,
    failureMessage,
    handleSuccessConfirm,
    handleFailureConfirm,
    errors,
    emailController,
    nameController,
    passwordController,
    passwordConfirmController,
  } = useSignupForm();

  return (
    <>
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
          <form className={styles.form} onSubmit={onSubmit} data-testid="signup-form">
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
                data-testid="email-input"
                value={emailController.field.value}
                onChange={emailController.field.onChange}
                onBlur={emailController.field.onBlur}
                name={emailController.field.name}
              />
              {errors.email && (
                <div className={styles.errorMessage} data-testid="email-error-message">
                  {errors.email.message}
                </div>
              )}
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
                data-testid="name-input"
                value={nameController.field.value}
                onChange={nameController.field.onChange}
                onBlur={nameController.field.onBlur}
                name={nameController.field.name}
              />
              {errors.name && (
                <div className={styles.errorMessage} data-testid="name-error-message">
                  {errors.name.message}
                </div>
              )}
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
                data-testid="password-input"
                value={passwordController.field.value}
                onChange={passwordController.field.onChange}
                onBlur={passwordController.field.onBlur}
                name={passwordController.field.name}
              />
              {errors.password && (
                <div className={styles.errorMessage} data-testid="password-error-message">
                  {errors.password.message}
                </div>
              )}
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
                data-testid="password-confirm-input"
                value={passwordConfirmController.field.value}
                onChange={passwordConfirmController.field.onChange}
                onBlur={passwordConfirmController.field.onBlur}
                name={passwordConfirmController.field.name}
              />
              {errors.passwordConfirm && (
                <div className={styles.errorMessage} data-testid="password-confirm-error-message">
                  {errors.passwordConfirm.message}
                </div>
              )}
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
              onClick={onSubmit}
              disabled={isSubmitting}
              data-testid="signup-button"
            >
              {isSubmitting ? '가입중...' : '회원가입'}
            </Button>
          </div>

          {/* 하단 갭 */}
          <div className={styles.leftGapBottom} />
        </div>

        {/* 오른쪽 영역 (배경) */}
        <div className={styles.rightSide} />
      </div>

      {/* 회원가입 성공 모달 */}
      <Modal
        id="signup-success-modal"
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
      >
        <ModalComponent
          variant="info"
          actions="single"
          title="회원가입 완료"
          description="회원가입이 완료되었습니다. 로그인 페이지로 이동합니다."
          confirmText="확인"
          onConfirm={handleSuccessConfirm}
        />
      </Modal>

      {/* 회원가입 실패 모달 */}
      <Modal
        id="signup-failure-modal"
        isOpen={showFailureModal}
        onClose={handleFailureConfirm}
      >
        <ModalComponent
          variant="danger"
          actions="single"
          title="회원가입 실패"
          description={failureMessage || '회원가입 중 오류가 발생했습니다.'}
          confirmText="확인"
          onConfirm={handleFailureConfirm}
        />
      </Modal>
    </>
  );
}

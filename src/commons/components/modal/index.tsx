import React from 'react';
import { Button } from '../button';
import styles from './styles.module.css';

// 모달 variant 타입 정의
export type ModalVariant = 'info' | 'danger';
export type ModalActions = 'single' | 'dual';

// 모달 컴포넌트 Props 타입 정의
export interface ModalProps {
  variant?: ModalVariant; // 기본: 'info'
  actions?: ModalActions; // 기본: 'single'
  title: string; // 모달 제목
  description: string; // 모달 설명
  confirmText?: string; // 확인 버튼 텍스트 (기본: '확인')
  cancelText?: string; // 취소 버튼 텍스트 (기본: '취소')
  onConfirm: () => void; // 확인 버튼 클릭 핸들러
  onCancel?: () => void; // 취소 버튼 클릭 핸들러 (dual 액션일 때만 사용)
  className?: string; // 외부 클래스 확장 지점
  confirmTestId?: string;
  cancelTestId?: string;
  logo?: string; // 로고 이미지 경로 (선택사항)
}

// 내부 유틸: 클래스 병합
function cx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}

// 피그마 디자인을 정확히 반영한 모달 컴포넌트
// - variant: 'info' | 'danger'
// - actions: 'single' | 'dual'
// - modal.provider와 함께 사용되므로 자체 backdrop 스타일 없음
export const Modal: React.FC<ModalProps> = ({
  variant = 'info',
  actions = 'single',
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  className,
  confirmTestId,
  cancelTestId,
  logo,
}) => {
  const rootClassName = cx(
    styles.root,
    variant === 'info' && styles.variantInfo,
    variant === 'danger' && styles.variantDanger,
    actions === 'single' && styles.actionsSingle,
    actions === 'dual' && styles.actionsDual,
    className,
  );

  return (
    <div className={rootClassName}>
      {/* 모달 콘텐츠 영역 */}
      <div className={styles.content}>
        {/* 타이틀 */}
        <h2 className={styles.title}>{title}</h2>
        
        {/* 설명 */}
        <p className={styles.description}>{description}</p>
        
        {/* 로고 (선택사항) */}
        {logo && (
          <div className={styles.logoContainer}>
            <img src={logo} alt="로고" className={styles.logo} />
          </div>
        )}
        
        {/* 버튼 영역 */}
        <div className={styles.buttonArea}>
          {actions === 'dual' && onCancel && (
          <Button
            variant="secondary"
            size="large"
            className={styles.cancelButton}
            onClick={onCancel}
            data-testid={cancelTestId ?? 'modal-cancel-button'}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          variant="primary"
          size={actions === 'single' ? 'small' : 'large'}
          className={styles.confirmButton}
          onClick={onConfirm}
          data-testid={confirmTestId ?? 'modal-confirm-button'}
        >
          {confirmText}
        </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


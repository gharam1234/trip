"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";

// 모달 컨텍스트 타입 정의
interface ModalContextType {
  modals: string[];
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

// 모달 컨텍스트 생성
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// 모달 프로바이더 컴포넌트
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 상태 관리
  useEffect(() => {
    setMounted(true);
  }, []);

  // 모달 열기
  const openModal = useCallback((id: string) => {
    setModals((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  // 모달 닫기
  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((modalId) => modalId !== id));
  }, []);

  // 모든 모달 닫기
  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  // 모달 열림 상태 확인
  const isModalOpen = useCallback(
    (id: string) => modals.includes(id),
    [modals],
  );

  // body 스크롤 제어
  useEffect(() => {
    if (modals.length > 0) {
      // 모달이 열려있으면 body 스크롤 제거
      document.body.style.overflow = "hidden";
    } else {
      // 모달이 모두 닫혀있으면 body 스크롤 복원
      document.body.style.overflow = "unset";
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modals.length]);

  const contextValue: ModalContextType = useMemo(
    () => ({
      modals,
      openModal,
      closeModal,
      closeAllModals,
      isModalOpen,
    }),
    [modals, openModal, closeModal, closeAllModals, isModalOpen],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {/* 모달 포털 컨테이너 */}
      {mounted && createPortal(
        <div id="modal-portal" className={styles.modalPortal} />,
        document.body
      )}
    </ModalContext.Provider>
  );
}

// 모달 컨텍스트 훅
export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal은 ModalProvider 내에서 사용되어야 합니다.");
  }
  return context;
}

// 모달 컴포넌트
interface ModalProps {
  id: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  'data-testid'?: string;
}

export function Modal({ id, children, isOpen, onClose, className = "", ...props }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {isOpen && (
        <div className={`${styles.modalOverlay} ${className}`} onClick={onClose} {...props}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </>,
    document.getElementById("modal-portal") || document.body
  );
}

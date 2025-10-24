"use client";

import { useState, useCallback } from "react";

// 주소 검색 훅 반환 타입 정의
export interface UseAddressHookReturn {
  isModalOpen: boolean;
  handleToggleModal: () => void;
  handleAddressComplete: (data: DaumAddressData) => void;
}

// Daum 주소 API 응답 데이터 타입 정의
export interface DaumAddressData {
  zonecode?: string;
  zipcode?: string;
  address?: string;
  roadAddress?: string;
  jibunAddress?: string;
  [key: string]: any;
}

/**
 * 주소 검색 훅 - antd Modal과 react-daum-postcode DaumPostcodeEmbed를 통합하기 위한 훅
 *
 * 기능:
 * - react-daum-postcode 라이브러리를 통한 주소 검색
 * - antd Modal 상태 관리
 * - react-hook-form과 통합하여 폼 필드 업데이트
 *
 * 사용 예시:
 * ```tsx
 * const addressHook = useAddressSearch((data) => {
 *   form.setValue('boardAddress.zipcode', data.zipcode);
 *   form.setValue('boardAddress.address', data.address);
 * });
 *
 * <Modal
 *   title="우편번호 & 주소찾기"
 *   open={addressHook.isModalOpen}
 *   onOk={addressHook.handleToggleModal}
 *   onCancel={addressHook.handleToggleModal}
 * >
 *   <DaumPostcodeEmbed onComplete={addressHook.handleAddressComplete} />
 * </Modal>
 * ```
 *
 * @param onAddressSelect - 주소 선택 완료 시 호출되는 콜백 함수
 * @returns UseAddressHookReturn 객체 (isModalOpen, handleToggleModal, handleAddressComplete)
 */
export function useAddressSearch(
  onAddressSelect: (data: DaumAddressData) => void
): UseAddressHookReturn {
  // 모달 오픈/클로즈 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 토글 핸들러 - useCallback으로 메모이제이션
  const handleToggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  /**
   * 주소 검색 완료 핸들러
   * react-daum-postcode의 DaumPostcodeEmbed에서 호출
   * Daum API의 응답 데이터를 정규화하여 부모 컴포넌트에 전달
   *
   * zonecode: 신우편번호 (5자리)
   * roadAddress: 도로명주소
   * jibunAddress: 지번주소
   *
   * @param data - Daum PostCode API 응답 데이터
   */
  const handleAddressComplete = useCallback((data: DaumAddressData) => {
    // 검색된 주소 데이터를 부모 컴포넌트에 전달
    // zonecode는 우편번호, roadAddress는 도로명주소, jibunAddress는 지번주소
    onAddressSelect({
      zipcode: data.zonecode || "",
      address: data.roadAddress || data.jibunAddress || data.address || "",
    });

    // 주소 선택 후 모달 닫기
    setIsModalOpen(false);
  }, [onAddressSelect]);

  return {
    isModalOpen,
    handleToggleModal,
    handleAddressComplete,
  };
}

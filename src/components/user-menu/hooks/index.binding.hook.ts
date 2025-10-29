'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

/**
 * GraphQL 응답 타입 정의
 */
interface UserPoint {
  amount?: number;
}

interface FetchUserLoggedInData {
  _id: string;
  name: string;
  picture?: string;
  userPoint?: UserPoint;
}

interface FetchUserInfoResponse {
  fetchUserLoggedIn: FetchUserLoggedInData;
}

/**
 * GraphQL 사용자 정보 조회 쿼리
 * userPoint는 객체 타입이고 amount 필드를 포함
 */
const FETCH_USER_INFO = gql`
  query FetchUserLoggedIn {
    fetchUserLoggedIn {
      _id
      name
      picture
      userPoint {
        amount
      }
    }
  }
`;

/**
 * 사용자 정보 바인딩 Type 정의
 */
export interface UserMenuBindingData {
  id: string;
  name: string;
  profileImage?: string;
  amount: number;
  formattedPoint: string;
}

/**
 * useUserMenuBinding Hook
 * Apollo Client useQuery를 사용하여 실제 API 데이터를 바인딩
 */
export function useUserMenuBinding() {
  const { data, loading, error } = useQuery<FetchUserInfoResponse>(FETCH_USER_INFO, {
    skip: false,
  });

  /**
   * 포인트 포맷팅 함수
   * 숫자를 "23,000" 형식으로 변환
   */
  const formatPoints = (amount: number): string => {
    return amount.toLocaleString('ko-KR');
  };

  /**
   * 데이터 변환 및 정규화
   */
  const userData: UserMenuBindingData | null = data?.fetchUserLoggedIn
    ? {
        id: data.fetchUserLoggedIn._id,
        name: data.fetchUserLoggedIn.name,
        profileImage: data.fetchUserLoggedIn.picture,
        amount: data.fetchUserLoggedIn.userPoint?.amount || 0,
        formattedPoint: formatPoints(data.fetchUserLoggedIn.userPoint?.amount || 0),
      }
    : null;

  return {
    userData,
    loading,
    error,
    isSuccess: !!userData,
    isFailure: !loading && (error !== undefined || !userData),
  };
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)


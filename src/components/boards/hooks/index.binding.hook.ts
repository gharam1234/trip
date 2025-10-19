"use client";

import { useState, useEffect } from 'react';

// 게시글 데이터 타입 정의
export interface BoardAddressInput {
  zipcode: string;
  address: string;
  addressDetail: string;
}

export interface BoardItem {
  boardId: string;
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl: string;
  boardAddress: BoardAddressInput;
  images: string[];
  createdAt: string;
}

// 리스트 표시용 데이터 타입
export interface BoardListItem {
  no: string; // boardId를 문자열로 변환
  title: string;
  author: string; // writer를 author로 매핑
  date: string; // createdAt을 포맷팅된 날짜로 변환
}

/**
 * 로컬스토리지에서 boards 데이터를 가져와서 리스트 표시용으로 변환하는 Hook
 * - 실제 로컬스토리지 데이터를 사용 (Mock 데이터 사용하지 않음)
 * - 데이터가 없을 경우 빈 배열 반환
 * - 제목이 길 경우 "..."으로 표시하여 칸 사이즈 유지
 */
export function useBoardsBinding() {
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행되도록 확인
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const loadBoards = () => {
      try {
        // 로컬스토리지에서 boards 데이터 가져오기
        const boardsData = localStorage.getItem('boards');
        
        if (!boardsData) {
          setBoards([]);
          setLoading(false);
          return;
        }

        // JSON 파싱
        const parsedBoards: BoardItem[] = JSON.parse(boardsData);
        
        // 리스트 표시용 데이터로 변환 (최신 순으로 정렬)
        const transformedBoards: BoardListItem[] = parsedBoards
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // 최신 순 정렬
          .map((board, index) => ({
            no: board.boardId,
            title: board.title.length > 50 ? `${board.title.substring(0, 50)}...` : board.title,
            author: board.writer,
            date: formatDate(board.createdAt)
          }));

        setBoards(transformedBoards);
        setError(null);
      } catch (err) {
        console.error('로컬스토리지 boards 데이터 파싱 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };

    // 즉시 실행
    loadBoards();
  }, []);

  return {
    boards,
    loading,
    error
  };
}

/**
 * 날짜 문자열을 YYYY.MM.DD 형식으로 포맷팅
 * @param dateString - ISO 날짜 문자열 또는 기타 날짜 형식
 * @returns 포맷팅된 날짜 문자열
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // 파싱 실패 시 원본 반환
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  } catch {
    return dateString; // 오류 시 원본 반환
  }
}

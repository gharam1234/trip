"use client";

import { useState, useEffect } from "react";

// 게시글 상세 주소 입력 타입
interface BoardAddressInput {
  zipcode?: string;
  address?: string;
  addressDetail?: string;
}

// 게시글 데이터 타입
export interface BoardData {
  boardId: string;
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl?: string;
  boardAddress?: BoardAddressInput;
  images?: string[];
  createdAt?: string;
}

// 바인딩 훅의 반환 타입
interface UseBoardDetailBindingReturn {
  boardData: BoardData | null;
  loading: boolean;
  error: string | null;
}

/**
 * 게시글 상세 바인딩 훅
 * 다이나믹 라우트의 boardId 파라미터를 받아 로컬스토리지에서 해당 게시글 데이터를 찾아 반환합니다.
 *
 * @param boardId - URL 파라미터에서 추출한 게시글 ID
 * @returns 게시글 데이터, 로딩 상태, 에러 메시지
 */
export function useBoardDetailBinding(
  boardId: string
): UseBoardDetailBindingReturn {
  // 게시글 데이터 상태
  const [boardData, setBoardData] = useState<BoardData | null>(null);

  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);

  // 에러 메시지
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 클라이언트에서만 실행되도록 보장
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // boardId가 없으면 에러 처리
      if (!boardId) {
        setError("게시글 ID가 없습니다.");
        setBoardData(null);
        setLoading(false);
        return;
      }

      // 로컬스토리지에서 boards 배열 가져오기
      const boardsJson = localStorage.getItem("boards");

      // boards 데이터가 없으면 에러 처리
      if (!boardsJson) {
        setError("게시글 데이터가 없습니다.");
        setBoardData(null);
        setLoading(false);
        return;
      }

      // JSON 파싱
      const boards: BoardData[] = JSON.parse(boardsJson);

      // boards가 배열이 아니거나 비어있으면 에러 처리
      if (!Array.isArray(boards) || boards.length === 0) {
        setError("게시글 목록이 비어있습니다.");
        setBoardData(null);
        setLoading(false);
        return;
      }

      // boardId와 일치하는 게시글 찾기
      const foundBoard = boards.find(
        (board) => String(board.boardId) === String(boardId)
      );

      // 일치하는 게시글이 없으면 에러 처리
      if (!foundBoard) {
        setError("게시글을 찾을 수 없습니다.");
        setBoardData(null);
        setLoading(false);
        return;
      }

      // 성공: 게시글 데이터 설정
      setBoardData(foundBoard);
      setError(null);
      setLoading(false);
    } catch (err) {
      // JSON 파싱 오류 등 처리
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(`오류가 발생했습니다: ${errorMessage}`);
      setBoardData(null);
      setLoading(false);
    }
  }, [boardId]);

  return {
    boardData,
    loading,
    error,
  };
}

'use client';

// React 관련
import React from 'react';

// Next.js 관련
import { useParams } from 'next/navigation';

// 내부 컴포넌트
import BoardsWriteWireframe from '@/components/boards-new';

// 게시판 수정 페이지
export default function BoardsEditPage(): JSX.Element {
  const params = useParams();
  const boardId = params?.BoardId as string;

  return (
    <main style={{ display: "flex", justifyContent: "center", padding: 0 }}>
      {/* 가운데 정렬로 1280px 고정 와이어프레임 표시 - 수정 모드 */}
      <BoardsWriteWireframe isEdit={true} boardId={boardId} />
    </main>
  );
}

"use client";

import React from "react";
import BoardsDetailWireframe from "@/components/boards-detail";
import BoardComments from "@/components/board-comments";
/**
 * 보드 상세 페이지
 * - 와이어프레임 컴포넌트를 연결하여 렌더링
 */
export default function BoardDetailPage(): JSX.Element {
  return (<>
  <BoardsDetailWireframe />
  <BoardComments id="1" author="John Doe" rating={5} content="This is a comment" date="2021-01-01" onEdit={() => {}} onDelete={() => {}} />
  </>)
}


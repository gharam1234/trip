"use client";

// 보드 리스트 화면 컴포넌트
// - 요구사항 영역 순서 및 픽셀 높이를 유지
// - 검색 영역에 공통컴포넌트(SelectBox, SearchBar, Button) 적용
// - 페이지네이션 영역에 공통컴포넌트(Pagination) 적용

import React from "react";
import styles from "./styles.module.css";
// 사용하지 않는 SelectBox 임포트 제거 (요구사항 범위 외)
import { SearchBar } from "@/commons/components/searchbar";
import { Button } from "@/commons/components/button";
import { Pagination } from "@/commons/components/pagination";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useLinkToNewBoard } from "./hooks/index.link.new.hook";
import { useBoardsBinding } from "./hooks/index.binding.hook";
import { useBoardRouting } from "./hooks/index.link.routing.hook";

export default function Boards(): JSX.Element {
  // 영역 순서 가이드
  // {gap40} -> title36 -> {gap24} -> search48 -> {gap24} -> main696 -> {gap8} -> pagination56 -> {gap56}

  // 상태: 검색어, 페이지 (필터 미사용)
  const [keyword, setKeyword] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const totalPages = 10; // 데모용, 실제 연동 시 데이터 기반으로 설정

  // 상태: 날짜 범위 (데모용)
  const [dateRange, setDateRange] = React.useState<[Dayjs | null, Dayjs | null] | null>(null);
  // 상태: 포맷된 날짜 문자열 (API 파라미터 연동 대비)
  const [dateRangeText, setDateRangeText] = React.useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  // Hook: 트립토크 등록 페이지로 이동
  const { navigateToNewBoard } = useLinkToNewBoard();
  
  // Hook: 로컬스토리지에서 게시글 데이터 바인딩
  const { boards, loading, error } = useBoardsBinding();
  
  // Hook: 게시글 상세페이지로 이동
  const { navigateToBoardDetail } = useBoardRouting();

  // 검색 실행 핸들러
  function handleSearchSubmit(): void {
    // TODO: 실제 데이터 요청 연동 시 여기에 API 호출/라우팅 로직 연결
    // 현재 상태: filter, keyword, page
    // 사용성: 검색 실행 시 페이지를 1로 리셋
    setPage(1);
  }

  return (
    <div className={styles.container} aria-label="boards" data-testid="boards-list-page">
      {/* 간격 40px */}
      <div className={styles.gap40} role="presentation" />

      {/* 타이틀 36px */}
      <div className={styles.title} aria-label="boards-title">
        트립토크 게시판
      </div>

      {/* 간격 24px */}
      <div className={styles.gap24} role="presentation" />

      {/* 검색 영역 48px */}
      <div className={styles.search} aria-label="boards-search">
        <div className={styles.searchRow}>
          <div className={styles.searchDatepicker}>
            {/* 데이트피커: antd RangePicker 적용, 토큰 기반 스타일 클래스 사용 */}
            <DatePicker.RangePicker
              allowClear
              placeholder={["YYYY.MM.DD", "YYYY.MM.DD"]}
              onChange={(values) => {
                setDateRange(values);
                if (values && values[0] && values[1]) {
                  const startText = dayjs(values[0]).format('YYYY-MM-DD');
                  const endText = dayjs(values[1]).format('YYYY-MM-DD');
                  setDateRangeText({ start: startText, end: endText });
                } else {
                  setDateRangeText({ start: null, end: null });
                }
              }}
              className={styles.wDatepicker}
              style={{ width: "100%" }}
            />
          </div>
          <SearchBar
            variant="primary"
            size="medium"
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            placeholder="제목을 검색해 주세요."
            className={styles.wSearch640}
          />
          <div className={styles.btnTertiaryBlack}>
            <Button
              variant="tertiary"
              size="medium"
              onClick={handleSearchSubmit}
            >
              검색
            </Button>
          </div>
        </div>
          <Button
            variant="primary"
            size="medium"
            className={styles.wButton}
            onClick={navigateToNewBoard}
            data-testid="trip-talk-button"
          >
            트립토크 등록
          </Button>
      </div>

      {/* 간격 24px */}
      <div className={styles.gap24} role="presentation" />

      {/* 메인 리스트 696px */}
      <div className={styles.main} aria-label="boards-main">
        <div className={styles.mainInner}>
          {/* 헤더 52px */}
          <div className={styles.listHeader} role="row">
            <div className={styles.colNo} role="columnheader">번호</div>
            <div className={styles.colTitle} role="columnheader">제목</div>
            <div className={styles.colAuthor} role="columnheader">작성자</div>
            <div className={styles.colDate} role="columnheader">날짜</div>
          </div>

          {/* 리스트 548px: 로컬스토리지 데이터 바인딩 */}
          <div className={styles.listBody} role="rowgroup">
            {loading ? (
              <div className={styles.listRow} role="row">
                <div className={styles.colNo} role="cell">로딩 중...</div>
                <div className={styles.colTitle} role="cell"></div>
                <div className={styles.colAuthor} role="cell"></div>
                <div className={styles.colDate} role="cell"></div>
              </div>
            ) : error ? (
              <div className={styles.listRow} role="row">
                <div className={styles.colNo} role="cell">오류</div>
                <div className={styles.colTitle} role="cell">{error}</div>
                <div className={styles.colAuthor} role="cell"></div>
                <div className={styles.colDate} role="cell"></div>
              </div>
            ) : boards.length === 0 ? (
              <div className={styles.listRow} role="row">
                <div className={styles.colNo} role="cell">-</div>
                <div className={styles.colTitle} role="cell">등록된 게시글이 없습니다.</div>
                <div className={styles.colAuthor} role="cell">-</div>
                <div className={styles.colDate} role="cell">-</div>
              </div>
            ) : (
              boards.map((item) => (
                <div 
                  key={item.no} 
                  className={styles.listRow} 
                  role="row"
                  onClick={() => navigateToBoardDetail(item.no)}
                >
                  <div className={styles.colNo} role="cell">{item.no}</div>
                  <div className={styles.colTitle} role="cell">{item.title}</div>
                  <div className={styles.colAuthor} role="cell">{item.author}</div>
                  <div className={styles.colDate} role="cell">{item.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 간격 8px */}
      <div className={styles.gap8} role="presentation" />

      {/* 페이지네이션 56px */}
      <div className={styles.pagination} aria-label="boards-pagination">
        <div className={styles.paginationInner}>
          {/* 피그마 스펙: 가운데 정렬, 전체 폭 1184, 높이 32, 간격 8 */}
          <Pagination
            variant="primary"
            size="medium"
            totalPages={totalPages}
            currentPage={page}
            onChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* 간격 56px */}
      <div className={styles.gap56} role="presentation" />
    </div>
  );
}



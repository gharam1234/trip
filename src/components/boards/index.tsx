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
import dayjs from "dayjs";
import { useLinkToNewBoard } from "./hooks/index.link.new.hook";
import { usePagination } from "./hooks/index.pagination.hook";
import { useBoardRouting } from "./hooks/index.link.routing.hook";
import { useAuthGuard } from "@/commons/providers/auth/auth.guard.hook";
import { useIndexing } from "./hooks/index.indexing.hook";
import { useDeleteBoard } from "./hooks/index.delete.hook";
import { useDatepickerFiltering } from "./hooks/datepicker.filtering.hook";
import { linkTo } from "@/commons/constants/url";

export default function Boards(): JSX.Element {
  // 영역 순서 가이드
  // {gap40} -> title36 -> {gap24} -> search48 -> {gap24} -> main696 -> {gap8} -> pagination56 -> {gap56}

  // 상태: 검색어
  const [keyword, setKeyword] = React.useState<string>("");

  // Hook: DatePicker 필터링 (날짜 범위 선택 및 자동 검색)
  const { dateRangeText, isSearching, setIsSearching, handleDateRangeChange } =
    useDatepickerFiltering();

  // Hook: 트립토크 등록 페이지로 이동
  const { navigateToNewBoard } = useLinkToNewBoard();

  const { currentPage, totalPages, boards, loading, error, handlePageChange } = usePagination(
    isSearching ? keyword : "",
    isSearching ? dateRangeText.start : null,
    isSearching ? dateRangeText.end : null
  );

  // Hook: 게시글 상세페이지로 이동
  const { navigateToBoardDetail } = useBoardRouting();

  // Hook: 권한 검증 및 모달 관리 (모달 렌더링을 위해 필요)
  const { LoginConfirmModal } = useAuthGuard();

  // Hook: 게시글 번호 계산 (totalCount 기반 인덱싱)
  const { calculateNumber } = useIndexing(currentPage);

  // Hook: 게시글 삭제
  const { handleDelete } = useDeleteBoard();

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;

    e.preventDefault();
    handleSearchSubmit();
  }

  // 검색 실행 핸들러
  function handleSearchSubmit(): void {
    // 검색 실행 상태 설정
    setIsSearching(true);
    // usePagination Hook이 자동으로 페이지를 1로 리셋함
  }

  return (
    <div className={styles.container} aria-label="boards" data-testid="boards-container">
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
              onChange={handleDateRangeChange}
              className={styles.wDatepicker}
              style={{ width: "100%" }}
            />
          </div>
          <SearchBar
            variant="primary"
            size="medium"
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            onKeyDown={handleSearchKeyDown}
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

          {/* 리스트 548px: API 데이터 바인딩 */}
          <div
            className={styles.listBody}
            role="rowgroup"
            data-testid="boards-list"
          >
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
                <div className={styles.colTitle} role="cell">
                  {isSearching ? "검색 결과가 없습니다." : "등록된 게시글이 없습니다."}
                </div>
                <div className={styles.colAuthor} role="cell">-</div>
                <div className={styles.colDate} role="cell">-</div>
              </div>
            ) : (
              boards.map((item, index) => {
                const boardNumber = calculateNumber(index);
                const href = linkTo('BOARD_DETAIL', { BoardId: item.no });

                return (
                  <a
                    key={item.no}
                    className={styles.listRow}
                    role="row"
                    href={href}
                    data-testid={`board-row-${boardNumber}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToBoardDetail(item.no);
                    }}
                  >
                    <div className={styles.colNo} role="cell" data-testid={`board-number-${boardNumber}`}>
                      {boardNumber}
                    </div>
                    <div className={styles.colTitle} role="cell">{item.title}</div>
                    <div className={styles.colAuthor} role="cell">{item.author}</div>
                    <div className={styles.colDate} role="cell">{item.date}</div>

                    {/* 삭제 아이콘 (호버 시 표시) */}
                    <img
                      src="/icons/delete.png"
                      alt="삭제"
                      width={24}
                      height={24}
                      className={styles.deleteIcon}
                      data-testid="delete-icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(item.no);
                      }}
                    />
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 간격 8px */}
      <div className={styles.gap8} role="presentation" />

      {/* 페이지네이션 56px */}
      <div className={styles.pagination} aria-label="boards-pagination" data-testid="boards-pagination">
        <div className={styles.paginationInner}>
          {/* 피그마 스펙: 가운데 정렬, 전체 폭 1184, 높이 32, 간격 8 */}
          <Pagination
            variant="primary"
            size="medium"
            totalPages={totalPages}
            currentPage={currentPage}
            onChange={(p) => handlePageChange(p)}
          />
        </div>
      </div>

      {/* 간격 56px */}
      <div className={styles.gap56} role="presentation" />
      
      {/* 로그인 확인 모달 (권한 검증 시 표시) */}
      <LoginConfirmModal />
    </div>
  );
}


// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)

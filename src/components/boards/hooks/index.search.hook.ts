import { useQuery } from "@apollo/client";
import { FETCH_BOARDS } from "../graphql/queries";
import { FetchBoardsResponse } from "../graphql/queries";

/**
 * SearchBar와 DatePicker 검색 기능 Hook
 * - 제목 검색어, 날짜 범위, 페이지를 기반으로 게시글 필터링
 *
 * @param search - 제목 검색어 (SearchBar 입력값)
 * @param startDate - 시작 날짜 (DatePicker 선택값, YYYY-MM-DD 형식)
 * @param endDate - 종료 날짜 (DatePicker 선택값, YYYY-MM-DD 형식)
 * @param page - 페이지 번호 (Pagination 상태)
 * @returns { data, loading, error, refetch } - GraphQL 쿼리 결과
 */
export function useSearch(
  search: string | null = null,
  startDate: string | null = null,
  endDate: string | null = null,
  page: number = 1
) {
  const { data, loading, error, refetch } = useQuery<FetchBoardsResponse>(
    FETCH_BOARDS,
    {
      variables: {
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: page,
      },
      fetchPolicy: "network-only", // 항상 서버에서 최신 데이터 가져오기
    }
  );

  return {
    data: data?.fetchBoards || [],
    loading,
    error: error?.message || null,
    refetch,
  };
}

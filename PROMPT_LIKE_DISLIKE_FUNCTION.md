아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

==============================================

조건-파일경로) 참고할 TSX 파일경로: src/components/boards-detail/index.tsx
조건-파일경로) 참고할 CSS 파일경로: src/components/boards-detail/styles.module.css
조건-파일경로) 구현될 GraphQL MUTATION 파일경로: src/components/boards-detail/graphql/mutations.ts
조건-파일경로) 구현될 HOOK 파일경로: src/components/boards-detail/hooks/index.like-dislike.function.hook.ts
조건-파일경로) 구현될 TEST 파일경로: src/components/boards-detail/tests/index.like-dislike.function.hook.spec.ts

==============================================

핵심요구사항) 다음의 기능을 playwright 테스트를 활용하여 TDD 기반으로 구현하고, 테스트에 통과할 때까지 반복할 것.

1) 테스트 제외 라이브러리
- jest
- @testing-library/react

2) 테스트 조건
- timeout은 설정하지 않거나, 500ms 미만으로 설정할 것.
- 페이지가 완전히 로드된 후 테스트할 것.
  - 페이지 로드 식별 요구사항: 고정식별자 data-testid 대기 방법
  - **중요금지사항** 페이지 로드 식별 금지사항: networkidle 대기 방법

3) 테스트 API 조건
3-1) 데이터
- 실제 API 데이터를 사용할 것.
- Mock 데이터를 사용하지 말 것.

3-2) 성공 시나리오
- 뮤테이션 호출 후 결과 처리

3-3) 실패 시나리오
- 뮤테이션 호출 실패 또는 네트워크 오류 처리

4) 데이터 조건
    - 저장소: 백엔드 서버(GraphQL API)
    - 요청방식: likeBoard, dislikeBoard mutation 
    

핵심요구사항) 좋아요/싫어요 버튼 클릭 시 GraphQL 뮤테이션을 호출하고, 응답 결과로 카운트를 업데이트할 것.

1) 뮤테이션 정의
- src/components/boards-detail/graphql/mutations.ts에 likeBoard, dislikeBoard 뮤테이션 정의할 것
- 뮤테이션 이름 : likeBoard ,dislikeBoard
- 파라미터 값 : boardId: ID!
- 반환값 : Int!
- 응답 타입 및 변수 타입 정의 포함

2) 버튼 클릭 이벤트 처리
- 좋아요 버튼: likeBoard 뮤테이션 호출
- 싫어요 버튼: dislikeBoard 뮤테이션 호출
- 클릭 후 API 응답을 받으면 캐시 업데이트 또는 refetch 수행

3) 상태 관리
- Apollo Client의 useMutation 활용
- 뮤테이션 완료 후 FETCH_BOARD 쿼리 캐시 업데이트
- 로딩 상태 및 에러 상태 처리

4) CSS 처리
- 버튼 클릭 상태(활성화/비활성화) 표현은 이미 구현되어 있으므로 유지
- 로딩 중인 경우 버튼 상태 표시 (optional)

5) 테스트
- 각 좋아요/싫어요 버튼 클릭 후 뮤테이션이 호출되고 카운트가 업데이트되는지 검증
- 네트워크 오류 발생 시 에러 처리 검증

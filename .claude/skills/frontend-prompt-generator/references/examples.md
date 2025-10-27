# 프롬프트 생성 예시

## 예시 1: 와이어프레임 프롬프트

**입력:**
- 컴포넌트: profile
- 페이지: src/app/profile/page.tsx
- 영역 구조:
  - header: 1280 * 80
  - content: 1280 * 600
  - footer: 1280 * 120

**출력:**

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc

==============================================

조건-파일경로) 구현될 TSX 파일경로: src/components/profile/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/profile/styles.module.css

==============================================

핵심요구사항) 완성된 컴포넌트를 페이지에서 import하여 연결시킬 것.
                - 연결될 경로: src/app/profile/page.tsx

핵심요구사항) HTML과 flexbox를 활용한 와이어프레임 구조만 만들어낼 것.

핵심요구사항) 각 영역은 아래의 수치값을 그대로 반영할 것. (단위: px)
                - {gap}: 1280 * 40
                - header: 1280 * 80
                - {gap}: 1280 * 24
                - content: 1280 * 600
                - {gap}: 1280 * 24
                - footer: 1280 * 120
                - {gap}: 1280 * 56
```

## 예시 2: UI 구현 프롬프트

**입력:**
- 컴포넌트: profile
- 피그마 채널: abc123
- 노드 ID: 123:456

**출력:**

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @02-wireframe.mdc
            - @03-ui.mdc

==============================================

조건-피그마) 활용할MCP: CursorTalkToFigmaMCP(채널명: abc123)
조건-피그마) 구현될 컴포넌트 노드ID(main 영역): 123:456

조건-파일경로) 구현될 TSX 파일경로: src/components/profile/index.tsx
조건-파일경로) 구현될 CSS 파일경로: src/components/profile/styles.module.css

==============================================

조건-공통목록) 사용할 색상 목록(global.css에 명시된 변수 토큰 활용)
            - 비슷한 토큰 선택하여 사용(하드코딩 금지)

조건-공통목록) 사용할 타이포그래피 목록(global.css에 명시된 변수 토큰 활용)
            - 비슷한 토큰 선택하여 사용(하드코딩 금지)

==============================================

핵심요구사항) MCP를 연동하여 피그마의 디자인을 이미 만들어져있는 와이어프레임의 main 영역에 그대로 구현할 것.
```

## 예시 3: 데이터 바인딩 프롬프트

**입력:**
- 컴포넌트: posts
- API: fetchPosts
- 필드 매핑:
  - id → _id
  - title → title
  - author → writer
  - date → createdAt

**출력:**

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

==============================================

조건-파일경로) 참고할 TSX 파일경로: src/components/posts/index.tsx
조건-파일경로) 참고할 CSS 파일경로: src/components/posts/styles.module.css
조건-파일경로) 구현될 HOOK 파일경로: src/components/posts/hooks/index.binding.hook.ts
조건-파일경로) 구현될 TEST 파일경로: src/components/posts/tests/index.binding.hook.spec.ts

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
- API 응답 데이터를 기반으로 바인딩

3-3) 실패 시나리오
- API 호출 실패 또는 빈 배열 처리

4) 데이터 조건
    - 저장소: 백엔드 서버(GraphQL API)
    - 요청방식: fetchPosts query
    - 요청 파라미터 구조:

        query fetchPosts(page:1) {
    _id
    writer
    title
    createdAt
  }

핵심요구사항) 현재의 모든 구조를 그대로 유지하고, 하드코딩된 Mock데이터를 제거하고, 실제 fetchPosts API 데이터를 바인딩할 것.

1) 바인딩할 데이터
- Apollo Client useQuery(fetchPosts) 결과

2) 데이터 바인딩 상세내용
- 번호: 게시글 객체의 _id
- 제목: 게시글 객체의 title
- 작성자: 게시글 객체의 writer
- 작성일: 게시글 객체의 createdAt
- 제목: 게시글 객체의 title → 사이즈를 넘어가는 경우, "..."으로 표현하여 해당 칸의 사이즈를 넘어가지 않도록 할 것

3) CSS 처리
- 제목이 길 경우 text-overflow: ellipsis; white-space: nowrap; overflow: hidden; 적용

4) 테스트
- 로컬스토리지 모킹 없이 실제 API 데이터를 테스트
- Playwright 테스트에서 API 호출 후 렌더링된 데이터를 검증
```

## 예시 4: 라우팅 기능 프롬프트

**입력:**
- 컴포넌트: posts
- 클릭 요소: 게시글
- ID 필드: postId
- 페이지 경로: /posts/[postId]

**출력:**

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

==============================================

조건-파일경로) 참고할 TSX 파일경로: src/components/posts/index.tsx
조건-파일경로) 참고할 CSS 파일경로: src/components/posts/styles.module.css
조건-파일경로) 구현될 HOOK 파일경로: src/components/posts/hooks/index.link.routing.hook.ts
조건-파일경로) 구현될 TEST 파일경로: src/components/posts/tests/index.link.routing.hook.spec.ts

==============================================

핵심요구사항) 다음의 기능을 playwright 테스트를 활용하여 TDD기반으로 구현하고, 테스트에 통과할 때까지 반복할 것.
            1) 테스트 제외 라이브러리
                - jest
                - @testing-library/react

            2) 테스트 조건
                - timeout은 설정하지 않거나, 500ms 미만으로 설정할 것.
                - 페이지가 완전히 로드된 후 테스트할 것.
                    - 페이지 로드 식별 요구사항: 고정식별자 data-testid 대기 방법
                    - 페이지 로드 식별 금지사항: networkidle 대기 방법
            
            3) 테스트 로컬스토리지 조건
                3-1) 데이터
                    - 실제데이터를 사용할 것.
                    - Mock데이터 사용하지 말 것.

                3-2) 성공시나리오
                    - 로컬스토리지 모킹하지 말 것.

                3-3) 실패시나리오
                    - 로컬스토리지 모킹하지 말 것.

            4) 테스트 데이터타입
                - 저장소: 로컬스토리지
                - key: posts
                - value: [{ 
                    postId: String,
                    writer: String,
                    title: String!,
                    content: String!,
                    createdAt: String
                }]

핵심요구사항) 각 게시글 클릭시, url.ts의 페이지URL에 정의된 경로로 이동할 것.
            1) 경로: commons/constants/url.ts
            2) 조건
                - CSS는 cursor: pointer만 추가할 것.
                - 경로를 하드코딩하지 말고, url.ts를 import 하여 적용할 것.
                - 해당 게시글에 바인딩된 postId를 사용할 것.

            3) 게시글 영역
                - 전체: url.ts에 정의된 상세페이지 => /posts/[postId]
```

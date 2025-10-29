# 토큰 자동 로그아웃 기능 구현 프롬프트

## 프롬프트 1: 토큰 만료 자동 로그아웃 핵심 기능 (필수)

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

==============================================

조건-파일경로) 수정될 TSX 파일경로: src/commons/providers/auth/auth.provider.tsx
조건-파일경로) 수정될 GraphQL 쿼리 파일경로: src/components/auth-login/hooks/index.form.hook.tsx
조건-파일경로) 구현될 TEST 파일경로: src/commons/providers/auth/tests/index.token-expiration.spec.ts

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
- 로그인 후 토큰 만료 시간이 localStorage에 저장됨
- 토큰 만료 시간이 현재 시간을 넘으면 자동 로그아웃

3-3) 실패 시나리오
- 토큰 만료 정보가 없는 경우 처리
- 로그아웃 전에 페이지 포커스 시에도 만료 여부 재확인

4) 데이터 조건
    - 저장소: 백엔드 서버(GraphQL API)
    - 요청방식: LoginUser mutation
    - 현재 요청 응답 구조:
      mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
          accessToken
        }
      }

핵심요구사항) index.form.hook.tsx에서 로그인 성공 시 토큰 유효기간(expiresIn, 초 단위)을 설정하여 login() 함수에 전달할 것.

**용어 정의:**
- expiresIn: 토큰의 유효기간 (초 단위, 예: 3600초 = 1시간)
- tokenExpiresAt: 토큰이 만료되는 시간 (타임스탐프, 밀리초 단위)

1) 파일 위치: src/components/auth-login/hooks/index.form.hook.tsx (82-127번 줄)
2) 수정 사항
  - onCompleted 콜백에서 expiresIn(토큰 유효기간) 설정
  - 서버에서 expiresIn이 전달되면 사용, 없으면 3600초(1시간) 기본값 사용
    const expiresIn = data.loginUser.expiresIn || 3600; // expiresIn이 없으면 3600초(1시간) 기본값
  - login() 함수 호출 시 expiresIn을 세 번째 파라미터로 전달:
    login(userInfo, pendingAccessToken, expiresIn)
3) Auth Provider의 login() 함수 시그니처 수정
  - 파일: src/commons/providers/auth/auth.provider.tsx
  - 기존: const login = useCallback((userData: any, accessToken: string): void => { ... }, [router])
  - 수정: const login = useCallback((userData: any, accessToken: string, expiresIn: number = 3600): void => { ... }, [router])

핵심요구사항) Auth Provider에서 토큰 만료 시간을 관리하고 자동 로그아웃할 것.
1) localStorage에 저장할 데이터
  - ACCESS_TOKEN_KEY: "accessToken" → 기존 (변경 없음)
  - TOKEN_EXPIRES_AT_KEY: "tokenExpiresAt" → 새로 추가 (타임스탐프, 밀리초 단위)
  - USER_KEY: "user" → 기존 (변경 없음)

2) login() 함수 수정
  - expiresIn(초 단위의 토큰 유효기간)을 받아서 현재 시간에 expiresIn(초)을 더하여 tokenExpiresAt(토큰 만료 시간) 계산
  - tokenExpiresAt을 localStorage에 저장 (타임스탐프, 밀리초 단위)
  - 계산 공식: tokenExpiresAt = Date.now() + (expiresIn * 1000)
  - 계산 예시: expiresIn이 3600초면, tokenExpiresAt = Date.now() + 3600000 (밀리초)

3) checkAuthStatus() 함수 수정
  - localStorage에서 tokenExpiresAt을 가져올 것
  - 현재 시간이 tokenExpiresAt을 넘으면 토큰이 만료된 것으로 판단
  - 만료된 경우 자동으로 logout() 호출
  - 로직: if (Date.now() >= tokenExpiresAt) { logout() }

4) 타이머 설정 (useEffect)
  - checkAuthStatus()가 마운트될 때 호출되는 것 외에도,
  - tokenExpiresAt(만료 시간)까지의 남은 시간만큼 타이머를 설정하여 정확한 시간에 자동 로그아웃
  - 타이머 설정 공식: setTimeout(() => { logout() }, tokenExpiresAt - Date.now())
  - 타이머 설정 예시: tokenExpiresAt이 1시간 뒤라면, setTimeout(() => { logout() }, 3600000)
  - 언마운트 시 타이머 정리 (clearTimeout)

5) 페이지 포커스 이벤트 추가
  - window의 'focus' 이벤트 리스너 추가
  - 페이지 포커스 시 checkAuthStatus() 호출하여 만료 여부 재확인
  - 이유: 다른 탭에서 오래 있다가 돌아온 경우, 만료되었을 수 있으므로

핵심요구사항) 테스트 케이스를 작성하여 다음을 검증할 것.
1) 로그인 후 tokenExpiresAt이 localStorage에 저장되는가
2) 현재 시간이 tokenExpiresAt을 넘으면 자동 로그아웃되는가
3) 페이지 포커스 이벤트 발생 시 만료 여부가 재확인되는가
4) 타이머가 정확한 시간에 로그아웃을 실행하는가
```

---

## 프롬프트 2: 토큰 만료 5분 전 경고 모달 (선택사항)

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

==============================================

조건-파일경로) 수정될 TSX 파일경로: src/commons/providers/auth/auth.provider.tsx
조건-파일경로) 구현될 모달 컴포넌트 파일경로: src/commons/providers/modal/components/TokenExpirationWarningModal.tsx
조건-파일경로) 구현될 TEST 파일경로: src/commons/providers/modal/components/tests/TokenExpirationWarningModal.spec.ts

==============================================

핵심요구사항) 토큰 만료 5분 전에 경고 모달을 표시할 것.

1) 모달 표시 시점
  - tokenExpiresAt(토큰 만료 시간)에서 300초(5분) 전에 모달 표시
  - 타이머 설정 공식: setTimeout(() => { 모달 표시 }, tokenExpiresAt - Date.now() - 300000)
  - 타이머 설정 예시: tokenExpiresAt이 1시간 뒤라면, setTimeout(() => { 모달 표시 }, 3600000 - 300000 = 3300000)

2) 모달 UI
  - 제목: "세션 만료 경고"
  - 내용: "토큰이 5분 후 만료됩니다. 계속하시려면 로그인을 다시 해주세요."
  - 버튼: "계속 사용" (모달 닫기) / "로그아웃" (즉시 로그아웃)

3) Auth Provider의 상태 추가
  - isTokenExpirationWarningOpen: boolean (경고 모달 표시 여부)
  - setIsTokenExpirationWarningOpen: (open: boolean) => void

4) 타이머 설정
  - Auth Provider의 useEffect에서 만료 5분 전 타이머 설정
  - 타이머 콜백: isTokenExpirationWarningOpen를 true로 설정
  - clearTimeout으로 정리

핵심요구사항) Layout에서 TokenExpirationWarningModal을 렌더링할 것.
1) 파일: src/commons/layout/index.tsx
2) AuthContext의 isTokenExpirationWarningOpen와 setIsTokenExpirationWarningOpen 사용
3) 모달 닫기 버튼 클릭 시 isTokenExpirationWarningOpen를 false로 설정
4) 로그아웃 버튼 클릭 시 logout() 호출
```

---

## 프롬프트 3: Apollo Client 캐시 정리 (선택사항)

```
아래의 조건을 모두 적용하여, 아래의 요구사항을 모두 구현할 것.
구현 결과를 체크리스트로 반환할 것.

==============================================

조건-커서룰) 아래의 커서룰을 적용하여 작업하고, 이 작업이 끝나면 해당 rules 적용 결과를 체크리스트로 반환할 것.
            - @01-common.mdc
            - @04-func.mdc

==============================================

조건-파일경로) 수정될 파일경로: src/commons/providers/auth/auth.provider.tsx
조건-파일경로) 참고 파일경로: src/commons/providers/apollo-client/apollo-client.provider.tsx

==============================================

핵심요구사항) 로그아웃 시 Apollo Client 캐시를 초기화할 것.

1) Apollo Client 접근 방법
  - apollo-client.provider.tsx에서 apolloClient 객체를 참고
  - 캐시 초기화 메서드: client.cache.reset() 또는 client.cache.clearStore()

2) Auth Provider의 logout() 함수 수정
  - 기존 로직 (localStorage 정리, 상태 초기화) 유지
  - 그 전에 Apollo Client 캐시 초기화 추가
  - 순서: 캐시 초기화 → localStorage 정리 → 상태 초기화 → 라우팅

3) apolloClient 주입 방법
  - Apollo Provider의 컨텍스트에서 apolloClient를 가져올 것
  - 또는 apollo-client.provider.tsx에서 apolloClient를 export하여 import할 것

핵심요구사항) Apollo Client 캐시 초기화로 이전 사용자의 데이터가 제거되어야 한다.
1) 테스트 검증 (선택)
  - 사용자 A로 로그인 후 게시글 목록 조회
  - 로그아웃
  - 사용자 B로 로그인
  - 사용자 A의 캐시 데이터가 남아있지 않은지 확인
```

---

## 구현 순서 가이드

### 필수 단계 (프롬프트 1)
1. GraphQL LoginUser 뮤테이션에 expiresIn 필드 추가 (서버와 협의 필요)
2. Auth Provider의 login(), checkAuthStatus() 함수 수정
3. 타이머 및 포커스 이벤트 설정
4. 테스트 작성 및 통과

### 선택 단계
- **프롬프트 2** (경고 모달): 프롬프트 1 완료 후 진행
- **프롬프트 3** (캐시 정리): 프롬프트 1 완료 후 진행

---

## 주의사항

1. **서버 API 수정 필요**
   - expiresIn 필드 추가 필요
   - 없으면 기본값(예: 3600초 = 1시간) 사용 가능

2. **테스트 시간 조정**
   - 실제 타이머는 길기 때문에, 테스트에서는 짧은 시간으로 설정
   - jest.useFakeTimers()로 타이머 제어 권장

3. **XSS 보안**
   - 현재 localStorage 사용이므로 XSS 공격에 취약
   - 필요 시 HttpOnly 쿠키로 변경 권장 (향후 작업)

<!--
=== 변경 주석 (자동 생성) ===
시각: 2025-10-29 16:25:35
변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
학습 키워드: 개념 식별 불가(자동 추정 실패)
-->


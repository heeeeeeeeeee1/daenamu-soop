# 🧪 테스트 가이드

## 실행 방법

```bash
cd server && npm test   # 단위 + 통합 테스트 18개
cd client && npm test   # 단위 + 컴포넌트/통합 테스트 47개
```

두 패키지 모두 [Vitest](https://vitest.dev)를 사용한다. 클라이언트는 jsdom 환경 +
Testing Library로 컴포넌트를 렌더링/조작한다.

---

## 테스트 시나리오

### 서버 (`server/src/*.test.ts`)

| 파일 | 시나리오 |
|---|---|
| `nickname.test.ts` (단위) | 닉네임이 항상 비어있지 않은 한글 문자열인지, 매번 다양한 조합이 나오는지 |
| `cors.test.ts` (단위) | `CLIENT_ORIGIN` 환경변수 파싱, 허용/비허용/origin 없음 요청의 CORS 판정 |
| `app.test.ts` (통합, 실제 소켓 연결) | 아래 표 참고 |

`app.test.ts`는 `createApp()`으로 실제 HTTP+Socket.io 서버를 임시 포트에 띄우고,
`socket.io-client`로 진짜 연결을 맺어 검증한다 (mock 아님).

| 시나리오 | 기대 동작 |
|---|---|
| `GET /health` | `{ ok: true, uptime: number }` 응답 |
| 소켓 연결 | `nickname`(문자열), `userCount`(현재 인원) 수신 |
| `getCount` 요청 | 현재 접속자 수로 응답 |
| 유효한 `shout` | 다른 접속자에게 `message`로 브로드캐스트 |
| 공백만 있는 `shout` | 무시 (브로드캐스트 없음) |
| 300자 초과 텍스트 | 300자로 잘림 |
| 64자 초과 `shoutId` | 서버가 새 id로 대체 (스푸핑/충돌 방지) |
| 64자 이하 `shoutId` | 그대로 사용 |
| rate limit 초과 (설정값 3개/0.5초) | 초과분은 무시 |
| IP당 동시 연결 제한 초과 (설정값 2개) | 3번째 연결은 즉시 disconnect |

### 클라이언트

| 파일 | 유형 | 시나리오 |
|---|---|---|
| `lib/transformDictionary.test.ts` | 단위 | 욕설 개수 카운트, 레벨별 변환, 원문이 결과에 노출되지 않음 |
| `lib/cellHelpers.test.ts` | 단위 | 셀 이름 변환, 헤더/데이터 행 텍스트, **원문(D열)이 항상 `(비공개)`로만 노출**(마스킹 우회 방지), 범위 밖 인덱스 처리 |
| `components/OnboardingModal.test.tsx` | 컴포넌트 | 배경/본문 클릭 전파, 확인·닫기 버튼 |
| `components/ShoutInput.test.tsx` | 컴포넌트 | Enter 제출, 공백 무시, trim, Escape, maxLength |
| `components/ChatPanel.test.tsx` | 컴포넌트 | 행 렌더링, 원문 마스킹 토글(행별 독립성), 행 선택/Ctrl+선택, activeCell 하이라이트, 셀 클릭 콜백, **스크롤 위치에 따른 자동 스크롤 여부** |
| `App.test.tsx` | 통합 (소켓 mock) | 최초 방문 시 온보딩 자동 표시, 이미 방문 시 미표시, 확인 시 닫힘+방문기록 저장, **🟢 아이콘으로 재열람**, 재열람이 방문기록을 건드리지 않음 |
| `hooks/useColResize.test.ts` | 단위(훅) | 기본 열 너비, 오른쪽 경계 드래그 시 확장, 최소 40px 제한, **C/D 경계 드래그(반대 방향) 시 D열이 좁아지고 넓어짐**, mouseup 이후 이동 무시 |

---

## 진행 중 발견하고 수정한 버그

1. **소켓 재연결 포기 (client)** — `reconnectionAttempts: 5`로는 Render 무료 티어
   콜드스타트(최대 30~60초)보다 먼저 재연결을 포기해 사용자가 배너만 보고 영영
   재연결되지 않을 수 있었음 → 무제한 재시도로 변경.
2. **CORS 전면 개방 (server)** — `origin: '*'`이라 아무 사이트나 소켓에 붙어 스팸을
   보내거나 대화를 엿볼 수 있었음 → allowlist로 제한.
3. **CORS 거부 시 요청마다 스택트레이스 로그 (server)** — 처음 구현에서 허용 안 된
   origin에 대해 `Error`를 던지게 했더니 매 요청마다 500 + 콘솔 스택트레이스가
   찍혀 로그 오염/잠재적 로그 폭탄이 될 수 있었음 → 에러 없이 조용히 헤더만
   생략하도록 수정 (테스트 작성 중 직접 서버를 띄워 발견).
4. **테스트 레이스 컨디션 (server 테스트 자체 버그)** — `nickname`과 `userCount`를
   순차적으로 `await`했더니, 서버가 연결 직후 두 이벤트를 동기적으로 연달아
   emit하는 바람에 두 번째 리스너를 등록하기 전에 이벤트를 놓쳐 테스트가
   타임아웃되는 문제 발견 → 두 리스너를 동시에 등록 후 `Promise.all`로 대기하도록 수정.
5. **테스트 중복 실행 (server 테스트 설정 버그)** — `npm run build`로 생성된
   `dist/*.test.js`를 Vitest 기본 설정이 `src/*.test.ts`와 함께 주워 담아 모든
   테스트가 두 번씩 실행되고 있었음 → `vitest.config.ts`에서 `src/**/*.test.ts`만
   포함하도록 명시.
6. **C열/D열 사이 크기 조정이 전혀 동작하지 않음 (client, 사용자 리포트)** — 열
   너비 조절 핸들(`.xl-col-resize`)은 항상 자기 열의 **오른쪽 경계**에만 그려지는데,
   C열(가변폭, `flex:1`)은 애초에 핸들을 렌더링하지 않았다. 그 결과 D열의 핸들은
   D/E 경계만 조절할 뿐, C와 D 사이 경계에는 드래그할 지점 자체가 없었다.
   → C열에도 핸들을 추가하되, `useColResize`의 `startResize`에 `direction` 파라미터를
   더해 D열 너비를 반대 방향(오른쪽 드래그 = D 축소)으로 조절하도록 수정.
7. **채팅창이 위로 스크롤해 읽는 중에도 새 메시지마다 강제로 맨 아래로 끌어내림
   (client, QA 중 발견)** — `ChatPanel`의 스크롤 effect가 조건 없이 매번
   `scrollTop = scrollHeight`를 설정해, 과거 메시지를 읽으려 위로 스크롤해도 다른
   사람이 메시지를 보내는 순간 강제로 바닥으로 끌려 내려갔음 → 이미 바닥 근처
   (120px 이내)에 있을 때만 자동으로 따라가도록 수정.

## 알려진 한계 (별도 조치 없이 리포트만)

- `client`의 `vite@4.4.5`가 의존하는 `esbuild`에 dev 서버 전용 moderate 취약점이
  있음(`npm audit`로 확인 가능). 프로덕션 빌드에는 영향 없고, 고치려면 Vite를
  메이저 버전(6/8)으로 올려야 해서 이번 작업 범위에서는 건드리지 않음.
- 이번 환경(Windows, chromium-cli 미설치)에서는 🟢 아이콘 hover 스타일을 실제
  브라우저 스크린샷으로는 확인하지 못했고, CSS 규칙이 옆 버튼(`.xl-qat-btn`)과
  동일함을 코드로만 검증함.

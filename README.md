# 🎋 대나무숲

> 회사에서 열받을 때, 욕을 입력하면 업무 메시지로 변환해주는 실시간 익명 채팅 서비스

**🔗 [https://daenamu-soop.vercel.app](https://daenamu-soop.vercel.app)**

**"X발 이 미친 프로젝트"** → **"3분기 실적 달성을 위한 액션플랜 수립이 필요합니다."**

옆자리 팀장이 봐도 그냥 엑셀 작업 중인 것처럼 보입니다.

---

## 어떻게 작동하나요?

1. 하고 싶은 말을 입력하고 Enter
2. 욕설 강도에 따라 자동으로 업무 문장으로 변환
3. 같은 서버에 접속한 사람들과 실시간으로 공유
4. 원문은 `*` 마스킹 처리 — 누구든 클릭해서 확인 가능
5. 화면은 그냥 엑셀입니다

| 입력 | 변환 결과 |
|------|-----------|
| 욕 1~2개 | 일상 업무 문장 ("일정 확인 부탁드립니다.") |
| 욕 3~5개 | 긴박한 업무 문장 ("오늘 EOD까지 결과 공유드리겠습니다.") |
| 욕 6개 이상 | 딱딱한 공식 문장 ("시너지 창출을 위한 크로스펑셔널 협업 강화 방안을...") |

---

## 주요 기능

### 위장 기능
- **Excel UI** — 타이틀바, 리본, 수식 입력줄, 시트탭까지 완전한 Excel 외형
- **리본 탭 7개** — 홈/삽입/페이지 레이아웃/수식/데이터/검토/보기 각각 다른 내용
- **시트탭 3개** — 업무현황(채팅), 월별현황(발신자별 통계), 팀별목표(가짜 KPI)
- **Office Add-in** — 진짜 Excel 365 안에서 사이드 패널로 실행 가능

### 채팅 기능
- **익명 닉네임** — 서버 접속 시 랜덤 한국어 닉네임 자동 부여 (예: 성난다람쥐)
- **실시간 공유** — 같은 URL 접속자들과 Socket.io로 즉시 브로드캐스트
- **원문 마스킹** — D열(원문)은 `*` 로 표시, 누구든 클릭해서 토글 가능
- **메시지 삭제** — 행 번호 클릭으로 행 선택 후 Delete 키

### 스프레드시트 기능
- **셀 클릭 선택** — 파란 테두리 + 열/행 헤더 강조 (진짜 Excel처럼)
- **화살표 키 이동** — ↑↓←→ 셀 이동
- **Ctrl+C 복사** — 선택된 셀 내용 클립보드 복사
- **데이터 탭 정렬** — 담당자 이름 A→Z / Z→A 실제 정렬
- **데이터 탭 필터** — 내 메시지만 보기 토글

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 클라이언트 | React 18, TypeScript, Vite |
| 서버 | Node.js, Express, Socket.io |
| 스타일 | CSS (Excel 테마 직접 구현) |
| 배포 | Vercel (클라이언트) + Render (서버) |

DB 없음. 메시지는 메모리에만 존재하며 서버 재시작 시 사라집니다.

---

## 로컬 실행

```bash
# 서버 (터미널 1)
cd server
npm install
npm run dev        # http://localhost:3001

# 클라이언트 (터미널 2)
cd client
npm install
npm run dev        # https://localhost:5173
```

브라우저에서 `https://localhost:5173` 접속 시 자체서명인증서 경고 → 무시하고 진행

## 테스트

```bash
cd server && npm test
cd client && npm test
```

테스트 시나리오와 실행 방법은 [TESTING.md](TESTING.md) 참고.

---

## 배포

### Render (서버)

| 설정 | 값 |
|------|----|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |
| 환경변수 `CLIENT_ORIGIN` (선택) | 허용할 클라이언트 origin, 콤마로 여러 개 지정 (기본값: Vercel 배포 주소 + localhost:5173) |

### Vercel (클라이언트)

| 설정 | 값 |
|------|----|
| Root Directory | `client` |
| Framework | Vite |
| 환경변수 `VITE_SOCKET_URL` | `https://[render-서비스명].onrender.com` |

---

## Excel Add-in으로 실제 Excel에서 사용하기

진짜 Excel 365 안에서 사이드 패널로 실행하는 방법:

1. 클라이언트 서버 실행 (`npm run dev`)
2. 백엔드 서버 실행 (`npm run dev`)
3. Excel 열기
4. **삽입** 탭 → **Office 추가 기능** → **내 추가 기능** → **파일에서 업로드**
5. `manifest.xml` 선택
6. **홈** 탭에 생긴 **"대나무숲 열기"** 버튼 클릭

> 배포 후에는 `manifest.xml`의 `localhost:5173`을 Vercel URL로 교체하면 됩니다.

---

## 파일 구조

```
daenamu-soop/
├── manifest.xml                  # Office Add-in 매니페스트
├── client/
│   ├── src/
│   │   ├── App.tsx               # 메인 (Excel UI 구조, 상태 관리)
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx     # 업무현황 시트 (채팅 뷰)
│   │   │   ├── MonthlySheet.tsx  # 월별현황 시트 (발신자 통계)
│   │   │   ├── TeamSheet.tsx     # 팀별목표 시트 (KPI 위장 데이터)
│   │   │   └── ShoutInput.tsx    # 수식 입력줄 텍스트 입력
│   │   └── lib/
│   │       ├── transformDictionary.ts  # 욕설 감지 + 업무 문장 변환
│   │       ├── socket.ts               # Socket.io 클라이언트
│   │       └── sound.ts                # Web Audio API 효과음
│   └── vite.config.ts
└── server/
    └── src/
        ├── index.ts              # Express + Socket.io 서버
        └── nickname.ts           # 랜덤 한국어 닉네임 생성
```

---

## 주의사항

- 메시지는 **서버 메모리에만** 저장됩니다. DB 없음, 로그 없음.
- Render 무료 플랜은 **15분 미사용 시 슬립** → 첫 접속 시 10~30초 대기
- 이 서비스는 스트레스 해소용입니다. 실제 업무 도구가 아닙니다. 아마도.

---

## 바이브코딩

이 프로젝트는 100% 바이브코딩으로 만들어졌습니다.

기획 의도: 회사에서 열받음  
개발 방식: 일단 만들고 봄  
코드 퀄리티: 돌아가면 된 거 아닌가요?

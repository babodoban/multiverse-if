# 멀티버스 이야기 생성 구현 가이드

## 구현 완료된 기능

### 1. 로컬 스토리지 저장
- ✅ 기본 정보 자동 저장 (`src/utils/storage.js`)
- ✅ 앱 시작 시 저장된 기본 정보 자동 로드
- ✅ 기본 정보 변경 시 자동 저장

### 2. 시나리오 초기화
- ✅ "다시 입력하기" 버튼 클릭 시 시나리오만 초기화
- ✅ 기본 정보는 유지됨

### 3. API 통합 구조
- ✅ API 호출 유틸리티 (`src/utils/api.js`)
- ✅ 환경 변수로 API URL 설정 가능

---

## 다음 단계: 백엔드 API 구현

### 방법 1: Vercel Serverless Functions (추천)

**장점:**
- 무료 티어 제공
- 배포 간단 (Git 연결만으로 자동 배포)
- 서버 관리 불필요

**구현 방법:**

1. **프로젝트 루트에 `api` 폴더 생성**
   ```
   react-vite-app/
   └── api/
       └── generate-story/
           └── index.js
   ```

2. **`api-examples/vercel-function-chatgpt.js` 파일을 `api/generate-story/index.js`로 복사**

3. **필요한 패키지 설치**
   ```bash
   npm install openai
   ```

4. **Vercel에 배포**
   ```bash
   npm install -g vercel
   vercel
   ```

5. **환경 변수 설정**
   - Vercel 대시보드 → Settings → Environment Variables
   - `OPENAI_API_KEY` 추가

6. **프론트엔드 환경 변수 설정**
   - `.env` 파일 생성:
   ```
   VITE_API_BASE_URL=https://your-project.vercel.app/api
   ```

### 방법 2: Express 서버

**장점:**
- 완전한 제어 가능
- 로컬 테스트 용이

**구현 방법:**

1. **백엔드 폴더 생성**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   ```

2. **패키지 설치**
   ```bash
   npm install express cors dotenv openai
   ```

3. **`api-examples/express-server.js`를 `backend/server.js`로 복사**

4. **환경 변수 설정**
   - `backend/.env` 파일 생성:
   ```
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
   PORT=3000
   ```

5. **서버 실행**
   ```bash
   node server.js
   ```

6. **프론트엔드 환경 변수 설정**
   - `react-vite-app/.env` 파일 생성:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

---

## AI API 선택

### ChatGPT (OpenAI) - ✅ 추천

**설정:**
1. https://platform.openai.com/api-keys 에서 API 키 생성
2. 결제 정보 등록 필요 (무료 크레딧 제공)

**장점:**
- 한국어 처리 우수
- 자연스러운 스토리 생성
- 안정적인 API

**비용:**
- GPT-4o-mini: 약 $0.15 / 1M 입력 토큰, $0.60 / 1M 출력 토큰
- 요청당 약 $0.002 ~ $0.01 정도

### Gemini (Google)

**설정:**
1. https://makersuite.google.com/app/apikey 에서 API 키 생성
2. 무료 티어 사용 가능 (일일 60회 제한)

**장점:**
- 무료 티어 제공
- 빠른 응답 속도

**단점:**
- 한국어 품질이 ChatGPT보다 낮을 수 있음

**사용법:**
- `api-examples/vercel-function-gemini.js` 참고
- `@google/generative-ai` 패키지 사용

---

## 테스트 방법

### 1. 로컬 테스트 (Express 서버)

```bash
# 터미널 1: 백엔드 서버 실행
cd backend
node server.js

# 터미널 2: 프론트엔드 실행
cd react-vite-app
npm run dev
```

### 2. 프론트엔드만 테스트 (모의 API)

현재 `AppContext.jsx`의 `generateStory` 함수가 API 실패 시 모의 데이터를 반환하므로, API 없이도 UI 테스트 가능합니다.

---

## 배포 체크리스트

### Vercel 배포 시

- [ ] `api/generate-story/index.js` 파일 생성
- [ ] `vercel.json` 설정 (필요시)
- [ ] Vercel에 프로젝트 연결
- [ ] 환경 변수 `OPENAI_API_KEY` 설정
- [ ] 프론트엔드 `.env`에 `VITE_API_BASE_URL` 설정
- [ ] 빌드 및 배포 테스트

### Express 서버 배포 시

- [ ] 서버 호스팅 플랫폼 선택 (Heroku, Railway, Render 등)
- [ ] 환경 변수 설정
- [ ] CORS 설정 확인
- [ ] 프론트엔드 API URL 업데이트

---

## 문제 해결

### API 호출 실패 시
- 콘솔에서 에러 확인
- API 키 유효성 확인
- CORS 설정 확인
- 네트워크 탭에서 요청/응답 확인

### 로컬 스토리지 문제
- 브라우저 개발자 도구 → Application → Local Storage 확인
- 키: `multiverse_basic_info`

### 기본 정보가 로드되지 않는 경우
- 브라우저 콘솔 확인
- `storage.js` 파일의 오타 확인
- 로컬 스토리지 권한 확인

---

## 구현 완료된 추가 기능

### ✅ 로딩 상태 개선
- **API 응답 시간 표시**: 실시간으로 경과 시간 표시 (예: "15초", "1분 30초")
- **에러 메시지 표시**: 
  - 네트워크 에러: "네트워크 연결을 확인해주세요."
  - API 에러: "이야기 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
  - 타임아웃: "응답 시간이 초과되었습니다. 다시 시도해주세요."
  - 에러 발생 시 "다시 시도" 버튼 제공
  - 5초 후 에러 메시지 자동 숨김
- **보상형 광고 영역**: `LoadingPage.jsx`에 주석으로 표시됨 (별도 구현 필요)

### ✅ 결과 캐싱
- **로컬 스토리지 캐싱**: 같은 입력값에 대해 재요청 방지
- **캐시 만료 시간**: 24시간
- **자동 캐시 확인**: API 호출 전 캐시 확인
- **캐시 키**: 입력값(기본정보 + 시나리오) 기반으로 생성

---

## 추가 개선 사항 (선택)

1. **프롬프트 최적화**
   - `PROMPT_GUIDE.md` 참고하여 프롬프트 수정
   - 더 구체적인 지시사항 추가
   - 스타일 가이드라인 명시

2. **보상형 광고 통합**
   - `LoadingPage.jsx`의 주석 영역에 광고 SDK 통합
   - API 응답 후 광고 시청 로직 추가

3. **비용 최적화**
   - 요청 길이 제한 (프론트엔드에서 입력 검증)
   - 응답 길이 제한 (`max_tokens` 설정)
   - 사용량 모니터링 (OpenAI 대시보드 활용)

---

## 프롬프트 수정

프롬프트를 수정하려면:
- `api/generate-story/index.js` 파일의 "프롬프트 작성 영역" 부분 수정
- 자세한 내용은 `PROMPT_GUIDE.md` 참고


# OpenAI API 호출 문제 해결 가이드

## 발견된 문제

1. **더미 데이터만 표시**: API 호출이 실패하거나 로컬 서버가 없을 때 더미 데이터가 반환됨
2. **로딩 화면 미표시**: 에러 발생 시 로딩 화면을 건너뛰고 바로 결과 페이지로 이동
3. **캐시 문제**: 같은 입력으로 테스트 시 캐시된 데이터만 반환

## 수정 완료 사항

### ✅ 1. 더미 데이터 반환 제거
- 에러 발생 시 더미 데이터를 반환하지 않고 에러만 표시
- 로딩 화면에서 에러 메시지가 표시되도록 수정

### ✅ 2. 캐시 일시 비활성화
- 개발 중에는 캐시를 사용하지 않도록 주석 처리
- 항상 실제 API 호출하도록 수정

### ✅ 3. 디버깅 로그 추가
- API 호출 시작/성공/실패 시 콘솔에 로그 출력
- 브라우저 개발자 도구에서 확인 가능

### ✅ 4. 에러 처리 개선
- 에러 발생 시 결과 페이지로 이동하지 않고 로딩 화면에 머무름
- 사용자가 에러 메시지를 확인하고 재시도할 수 있음

---

## 백엔드 URL 설정

### 현재 상황
- `.env.local`에 `VITE_API_BASE_URL=http://localhost:3000/api` 설정됨
- 이것은 로컬 Vercel 개발 서버를 사용하려는 설정입니다

### 옵션 1: 배포된 백엔드 사용 (권장)

`.env.local` 파일을 수정:
```env
# 로컬 개발 환경 변수 (프론트엔드용)
VITE_API_BASE_URL=https://multiverse-if.vercel.app/api
```

또는 Vercel 프론트엔드 프로젝트의 환경 변수에서 설정:
- Key: `VITE_API_BASE_URL`
- Value: `https://multiverse-if.vercel.app/api`

### 옵션 2: 로컬 백엔드 서버 사용

로컬에서 백엔드를 테스트하려면:
```bash
cd backend
vercel dev
```

그러면 `http://localhost:3000/api`에서 백엔드가 실행됩니다.

---

## 테스트 방법

1. **브라우저 개발자 도구 열기** (F12)
2. **Console 탭 확인**:
   - `🚀 API 호출 시작:` 로그 확인
   - API URL이 올바른지 확인
   - `✅ API 응답 성공:` 또는 `❌ API 호출 실패:` 로그 확인

3. **Network 탭 확인**:
   - `/generate-story` 요청이 보이는지 확인
   - 요청 상태 코드 확인 (200 OK 여부)
   - 응답 내용 확인

---

## 예상되는 문제와 해결

### 문제 1: CORS 에러
**증상**: `CORS policy: No 'Access-Control-Allow-Origin' header`
**해결**: 백엔드의 CORS 설정이 이미 되어 있으므로, 백엔드가 제대로 배포되었는지 확인

### 문제 2: 404 에러
**증상**: `404 NOT_FOUND`
**해결**: 
- 백엔드 URL이 올바른지 확인
- `/api/generate-story` 경로가 맞는지 확인

### 문제 3: 500 에러
**증상**: `500 Internal Server Error`
**해결**:
- Vercel 백엔드 프로젝트의 Functions 탭에서 로그 확인
- OpenAI API 키가 올바르게 설정되었는지 확인

### 문제 4: 네트워크 에러
**증상**: `Failed to fetch` 또는 `NetworkError`
**해결**:
- 인터넷 연결 확인
- 백엔드 URL이 접근 가능한지 확인 (브라우저에서 직접 접속 테스트)

---

## 다음 단계

1. **백엔드 URL 확인 및 설정**
   ```bash
   # .env.local 파일 수정 또는 Vercel 환경 변수 설정
   VITE_API_BASE_URL=https://multiverse-if.vercel.app/api
   ```

2. **프론트엔드 재시작**
   ```bash
   cd react-vite-app
   npm run dev
   ```

3. **테스트**
   - BasicInfoPage에서 정보 입력
   - ScenarioInputPage에서 시나리오 입력
   - LoadingPage에서 로딩 확인
   - 브라우저 콘솔에서 로그 확인
   - ResultPage에서 실제 AI 응답 확인

---

## 디버깅 팁

브라우저 콘솔에서 확인할 로그:
- `🚀 API 호출 시작:` - API 호출이 시작되었는지
- `✅ API 응답 성공:` - API 응답이 성공했는지
- `❌ API 호출 실패:` - 에러 상세 정보

Network 탭에서 확인:
- Request URL
- Request Method (POST)
- Request Payload (basicInfo, scenario)
- Response Status
- Response Body


# 로컬 개발 환경 CORS 오류 해결

## 문제
개발 환경(localhost)에서 API 호출 시 응답이 오지 않음
- 운영 환경에서는 정상 작동
- 개발 환경(localhost)에서만 문제 발생

## 원인
백엔드 CORS 허용 목록에 로컬 개발 서버 URL이 없었음

## 해결 방법

### 백엔드 CORS 허용 목록에 localhost 추가
`backend/api/generate-story/index.js` 파일에 다음 URL들을 허용 목록에 추가:

```javascript
const allowedOrigins = [
  // ... 기존 URL들
  // 로컬 개발 환경
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];
```

### 로컬 개발 환경 자동 감지
`localhost` 또는 `127.0.0.1`이 포함된 모든 URL을 자동으로 허용하도록 로직 추가

## 확인 방법

1. **백엔드 개발 서버 실행**
   ```bash
   cd backend
   vercel dev
   ```

2. **프론트엔드 개발 서버 실행**
   ```bash
   cd react-vite-app
   npm run dev
   ```

3. **브라우저 콘솔 확인**
   - `🚀 API 호출 시작:` 로그에서 URL 확인
   - `✅ API 응답 성공:` 로그 확인
   - CORS 에러 없이 정상 응답 받는지 확인

4. **백엔드 터미널 로그 확인**
   - `[CORS] ✅ 로컬 개발 환경 일치:` 로그 확인

## 추가 참고사항

### 프론트엔드 포트 확인
- Vite 기본 포트: `5173`
- Granite 설정에 따라 다른 포트일 수 있음
- `granite.config.ts`에서 `web.port` 확인

### 백엔드 포트 확인
- Vercel dev 기본 포트: `3000`
- `.env.local`의 `VITE_API_BASE_URL`과 일치하는지 확인


# 로컬 개발 환경 문제 해결

## 발견된 문제

### 1. OpenAI 패키지 미설치
```
Error: Cannot find package 'openai'
```
**해결**: `backend` 폴더에서 `npm install` 실행 필요

### 2. CORS 에러 (로컬 개발 환경)
```
Access to fetch at 'http://localhost:3000/api/generate-story' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## 해결 방법

### 1. 의존성 설치
```bash
cd backend
npm install
```

### 2. 백엔드 개발 서버 실행
```bash
cd backend
vercel dev
```

서버가 `http://localhost:3000`에서 실행되는지 확인

### 3. 프론트엔드 개발 서버 실행
```bash
cd react-vite-app
npm run dev
```

서버가 `http://localhost:5173`에서 실행되는지 확인

### 4. CORS 설정 확인
백엔드 코드에 이미 `localhost:5173`이 허용 목록에 추가되어 있습니다:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- 등등

또한 `localhost` 또는 `127.0.0.1` 포함 시 자동 허용 로직도 있습니다.

## 문제 지속 시 확인 사항

1. **백엔드 서버가 실행 중인지 확인**
   - `vercel dev` 명령어가 정상 실행되었는지
   - `http://localhost:3000`에 접속 가능한지

2. **백엔드 터미널 로그 확인**
   - `[CORS] 요청 정보:` 로그 확인
   - `[CORS] ✅ 로컬 개발 환경 일치:` 로그 확인
   - OPTIONS 요청이 들어오는지 확인

3. **브라우저 네트워크 탭 확인**
   - OPTIONS 요청이 보이는지
   - 응답 헤더에 `Access-Control-Allow-Origin`이 있는지

4. **환경 변수 확인**
   - `.env.local`의 `VITE_API_BASE_URL`이 `http://localhost:3000/api`인지

## 예상 원인

1. **백엔드 서버 미실행**: `vercel dev`를 실행하지 않았을 가능성
2. **코드 변경 미반영**: `vercel dev` 재시작 필요
3. **포트 불일치**: 백엔드가 다른 포트에서 실행 중일 가능성

## 빠른 체크리스트

- [ ] `backend` 폴더에서 `npm install` 실행
- [ ] `backend` 폴더에서 `vercel dev` 실행
- [ ] 백엔드 터미널에서 `[CORS]` 로그 확인
- [ ] 프론트엔드에서 `http://localhost:5173` 접속
- [ ] 브라우저 콘솔에서 에러 확인


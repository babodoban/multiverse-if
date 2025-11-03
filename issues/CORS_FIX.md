# CORS 에러 해결 가이드

## 문제 분석

### 에러 메시지
```
Access to fetch at 'https://multiverse-if-backend.vercel.app/api/generate-story' 
from origin 'https://multiverse-if-dpf1.vercel.app' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 근본 원인

1. **Preflight 요청 실패**
   - 브라우저가 POST 요청 전에 OPTIONS 요청을 보냄 (Preflight)
   - OPTIONS 응답에 CORS 헤더가 없거나 올바르지 않음

2. **Vercel Serverless Functions의 CORS 처리**
   - 헤더 설정 순서나 방식이 중요할 수 있음
   - 모든 응답(OPTIONS, POST)에 CORS 헤더가 포함되어야 함

---

## 해결 방법

### ✅ 적용된 수정사항

1. **CORS 헤더 개선**
   - 모든 응답에 일관되게 CORS 헤더 설정
   - `Access-Control-Max-Age` 추가 (Preflight 캐싱)

2. **OPTIONS 요청 명시적 처리**
   - OPTIONS 요청 시 CORS 헤더를 명시적으로 설정 후 응답

3. **프론트엔드 API URL 수정**
   - 올바른 백엔드 URL 사용: `https://multiverse-if-backend.vercel.app/api`

---

## 개념 이해

### CORS란?

**Cross-Origin Resource Sharing (CORS)**
- 다른 도메인에서의 리소스 접근을 제어하는 브라우저 보안 메커니즘
- 프론트엔드(`multiverse-if-dpf1.vercel.app`)와 백엔드(`multiverse-if-backend.vercel.app`)가 다른 도메인
- 브라우저가 보안상 자동으로 차단

### Preflight 요청이란?

**복잡한 요청(Complex Request)의 경우:**
1. 브라우저가 먼저 **OPTIONS** 요청 전송 (Preflight)
2. 서버가 CORS 허용 확인
3. 허용되면 실제 **POST** 요청 전송

**필수 조건:**
- OPTIONS 응답에 `Access-Control-Allow-Origin` 헤더 필요
- 실제 POST 응답에도 동일한 헤더 필요

---

## 수정된 코드

### 백엔드 (`backend/api/generate-story/index.js`)

```javascript
export default async function handler(req, res) {
  // CORS 헤더 설정 (모든 요청에 대해)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24시간
  };

  // 모든 응답에 CORS 헤더 추가
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  // OPTIONS 요청 (Preflight) 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // ... 나머지 로직
}
```

### 프론트엔드 (`react-vite-app/src/utils/api.js`)

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://multiverse-if-backend.vercel.app/api';
```

---

## 다음 단계

1. **코드 커밋 및 푸시**
   ```bash
   git add -A
   git commit -m "Fix: CORS headers for preflight requests"
   git push origin main
   ```

2. **Vercel 자동 재배포 확인**
   - 백엔드 프로젝트 재배포 확인
   - 프론트엔드 프로젝트 재배포 확인

3. **테스트**
   - 브라우저 콘솔 확인
   - Network 탭에서 OPTIONS 요청 확인 (Status: 200)
   - POST 요청 확인 (Status: 200)
   - CORS 에러가 사라지는지 확인

---

## 추가 확인사항

### Vercel 환경 변수 확인

프론트엔드 Vercel 프로젝트에서:
- `VITE_API_BASE_URL` 환경 변수가 올바른지 확인
- 값: `https://multiverse-if-backend.vercel.app/api`

### 백엔드 배포 확인

백엔드 Vercel 프로젝트에서:
- Functions 탭에서 `api/generate-story` 함수 확인
- 최근 배포가 성공했는지 확인
- 로그에서 CORS 관련 에러 확인

---

## 예상 결과

수정 후:
- ✅ OPTIONS 요청 성공 (200 OK)
- ✅ POST 요청 성공 (200 OK)
- ✅ CORS 에러 없음
- ✅ 실제 OpenAI API 응답 수신


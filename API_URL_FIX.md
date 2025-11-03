# API URL 수정 안내

## 문제 발견
프론트엔드가 잘못된 백엔드 URL을 호출하고 있었습니다:
- ❌ 잘못된 URL: `https://multiverse-if-backend.vercel.app/api/generate-story`
- ✅ 올바른 URL: `https://multiverse-if.vercel.app/api/generate-story`

## 수정 완료 사항

### 1. 코드 기본값 수정
`react-vite-app/src/utils/api.js` 파일의 기본 URL을 수정했습니다:
```javascript
// 이전
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://multiverse-if-backend.vercel.app/api';

// 수정 후
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://multiverse-if.vercel.app/api';
```

## 추가 설정 필요

### 로컬 개발 환경
로컬에서 테스트하려면 `.env.local` 파일을 수정하세요:
```env
VITE_API_BASE_URL=https://multiverse-if.vercel.app/api
```

### Vercel 배포 환경
Vercel 프론트엔드 프로젝트의 환경 변수를 설정해야 합니다:

1. **Vercel 대시보드 접속**
   - https://vercel.com
   - 프론트엔드 프로젝트 선택

2. **Settings → Environment Variables**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://multiverse-if.vercel.app/api`
   - 모든 환경에 적용 (Production, Preview, Development)

3. **재배포**
   - 환경 변수 설정 후 자동 재배포 또는 수동 재배포

## 확인 방법

배포 후 브라우저 콘솔에서 확인:
```javascript
🚀 API 호출 시작: {
  url: "https://multiverse-if.vercel.app/api/generate-story",
  ...
}
```

올바른 URL로 호출되는지 확인하세요!


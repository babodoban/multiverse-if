# CORS 404 Not Found 에러 해결 가이드

## 문제

OPTIONS 요청이 404 Not Found를 반환합니다:
- 요청 URL: `https://multiverse-if.vercel.app/api/generate-story`
- 에러: `x-vercel-error: NOT_FOUND`
- 원인: Vercel Serverless Function 경로를 찾을 수 없음

## 원인 분석

1. **백엔드 프로젝트가 별도로 배포되어야 함**
   - 백엔드는 `backend/` 폴더에 있음
   - Vercel에서 Root Directory를 `backend`로 설정해야 함
   
2. **현재 상황**
   - 프론트엔드 preview: `https://multiverse-if-dpf1.vercel.app`
   - 백엔드 API 호출: `https://multiverse-if.vercel.app/api/generate-story`
   - 하지만 이 도메인에 함수가 배포되지 않음

## 해결 방법

### 방법 1: 백엔드를 별도 프로젝트로 배포 (권장)

1. **Vercel 대시보드에서 새 프로젝트 생성**
   - 같은 GitHub 저장소 선택
   - **Root Directory**: `backend` 선택 ⚠️ 중요!
   - **Framework Preset**: "Other" 또는 "Vercel"
   - **Build Command**: (비워둠)
   - **Output Directory**: (비워둠)

2. **환경 변수 설정**
   - `OPENAI_API_KEY` 추가

3. **배포 후 URL 확인**
   - 예: `https://multiverse-if-backend.vercel.app`
   - 또는 커스텀 도메인: `https://api.multiverse-if.vercel.app`

4. **프론트엔드 환경 변수 업데이트**
   - `VITE_API_BASE_URL`: `https://multiverse-if-backend.vercel.app/api`

### 방법 2: 백엔드를 프론트엔드와 같은 프로젝트에 포함 (비권장)

만약 같은 프로젝트에 포함하려면:
- 프론트엔드 프로젝트의 Root Directory를 루트(`/`)로 설정
- `backend/api/`를 `api/`로 복사하거나 심볼릭 링크
- 이 방법은 권장하지 않음 (관리 복잡)

## 현재 설정 확인

### 백엔드 프로젝트 구조
```
backend/
├── api/
│   └── generate-story/
│       └── index.js  ✅ 올바른 위치
├── package.json
└── vercel.json
```

### vercel.json 확인
```json
{
  "version": 2,
  "functions": {
    "api/generate-story/index.js": {
      "maxDuration": 30
    }
  }
}
```

## 즉시 확인 사항

1. **Vercel 대시보드 확인**
   - 백엔드 프로젝트가 별도로 있는지 확인
   - Root Directory가 `backend`로 설정되어 있는지 확인

2. **배포 로그 확인**
   - Functions 탭에서 `/api/generate-story` 함수가 있는지 확인
   - 최근 배포가 성공했는지 확인

3. **백엔드 URL 확인**
   - 실제 배포된 백엔드 URL 확인
   - `https://multiverse-if-backend.vercel.app/api/generate-story` 같은 URL인지 확인

## 다음 단계

1. 백엔드를 별도 프로젝트로 배포
2. 프론트엔드 `VITE_API_BASE_URL` 환경 변수 업데이트
3. 재배포 및 테스트


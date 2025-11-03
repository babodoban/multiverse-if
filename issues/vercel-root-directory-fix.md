# Vercel Root Directory 설정 문제 해결

## 현재 상황

1. **백엔드 프로젝트**: `multiverse-if.vercel.app`
   - Root Directory: 설정되지 않음 (자동)
   - Functions 탭에 함수가 보이지 않음

2. **프로젝트 구조**:
```
multiverse-if/ (GitHub 저장소 루트)
├── backend/
│   └── api/
│       └── generate-story/
│           └── index.js
└── react-vite-app/
```

## 문제 원인

**Root Directory가 설정되지 않으면:**
- Vercel은 저장소 루트(`/`)에서 `api/` 폴더를 찾습니다
- 하지만 실제 함수는 `backend/api/`에 있습니다
- 따라서 Vercel이 함수를 찾지 못합니다

## 해결 방법

### 방법 1: Root Directory를 `backend`로 설정 (권장)

**Vercel 대시보드에서:**

1. **백엔드 프로젝트 설정** (`multiverse-if` 프로젝트)
   - Settings → General → Root Directory
   - `backend` 입력 또는 선택
   - Save

2. **재배포**
   - Deployments 탭
   - 최신 배포의 "..." 메뉴 → Redeploy

3. **확인**
   - Functions 탭에서 `/api/generate-story` 함수 확인
   - 또는 `https://multiverse-if.vercel.app/api/generate-story` 직접 접속 테스트

### 방법 2: Root Directory 없이 작동하도록 구조 변경

만약 Root Directory 설정에 문제가 있었다면, 다음을 확인:

1. **GitHub 저장소 구조 확인**
   - `.vercelignore` 파일이 있는지 확인
   - `backend` 폴더가 gitignore에 포함되어 있지 않은지 확인

2. **Root Directory 문제 해결**
   - 어떤 문제가 있었는지 확인 필요
   - 일반적인 문제:
     - 경로 오류
     - 빌드 실패
     - 환경 변수 문제

## 확인할 사항

### 1. 백엔드 프로젝트 설정 확인

Vercel 대시보드에서:
- [ ] Settings → General → Root Directory 값 확인
- [ ] 빈 값이면 `backend` 입력
- [ ] Build & Development Settings 확인:
  - Build Command: (비어있어야 함)
  - Output Directory: (비어있어야 함)
  - Install Command: `npm install` 또는 (비어있어야 함)

### 2. 배포 로그 확인

- [ ] Deployments 탭에서 최신 배포 확인
- [ ] 빌드 로그에서 에러 확인
- [ ] Functions 탭에서 함수 목록 확인

### 3. 직접 API 테스트

터미널에서:
```bash
curl https://multiverse-if.vercel.app/api/generate-story
```

또는 브라우저에서:
```
https://multiverse-if.vercel.app/api/generate-story
```

- **정상**: CORS 에러 또는 "Method not allowed" (OPTIONS만 허용)
- **비정상**: 404 Not Found

### 4. 로컬 테스트

```bash
cd backend
vercel dev
```

- 로컬에서 `http://localhost:3000/api/generate-story` 접속
- 정상 작동하는지 확인

## Root Directory 설정 시 발생했던 문제

어떤 문제가 발생했는지 알려주시면 더 구체적인 해결책을 제시할 수 있습니다:
- [ ] 빌드 실패?
- [ ] 경로 오류?
- [ ] 환경 변수 문제?
- [ ] 다른 에러?


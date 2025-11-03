# Vercel 배포 완전 가이드

## 📁 프로젝트 구조

```
multiverse-if/
├── backend/              # 백엔드 (Vercel Serverless Functions)
│   ├── api/
│   │   └── generate-story/
│   │       └── index.js
│   ├── package.json
│   └── vercel.json
├── react-vite-app/       # 프론트엔드 (React + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── examples/            # 참고 예제
```

---

## 🚀 배포 순서

### Step 1: GitHub 저장소 생성

1. **GitHub에 로그인**
   - https://github.com 접속

2. **새 저장소 생성**
   - 우측 상단 "+" 클릭 → "New repository"
   - Repository name: `multiverse-if` (또는 원하는 이름)
   - Public 또는 Private 선택
   - "Create repository" 클릭

3. **로컬에서 Git 초기화 및 푸시**
   ```bash
   cd /Users/sirloin/Desktop/multiverse-if
   
   # Git 초기화 (아직 초기화되지 않은 경우)
   git init
   
   # .gitignore 확인 (이미 있음)
   # .env.local 파일은 커밋되지 않도록 .gitignore에 포함되어 있습니다
   
   # 모든 파일 추가
   git add .
   
   # 첫 커밋
   git commit -m "Initial commit: Multiverse IF app"
   
   # GitHub 저장소 연결 (위에서 생성한 저장소 URL 사용)
   git remote add origin https://github.com/YOUR_USERNAME/multiverse-if.git
   
   # 메인 브랜치 설정
   git branch -M main
   
   # 푸시
   git push -u origin main
   ```

---

### Step 2: Vercel 계정 생성 및 프로젝트 연결

1. **Vercel 가입**
   - https://vercel.com 접속
   - "Sign Up" 클릭
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 생성**
   - 대시보드에서 "Add New..." → "Project" 클릭
   - "Import Git Repository" 선택
   - GitHub 저장소 선택 (`multiverse-if`)
   - "Import" 클릭

---

### Step 3: 백엔드 배포 (Vercel)

#### 3-1. 백엔드 프로젝트 설정

1. **프로젝트 설정 화면에서:**
   - **Framework Preset**: "Other" 선택
   - **Root Directory**: `backend` 선택 (중요!)
   - **Build Command**: (비워둠 또는 `echo "No build needed"`)
   - **Output Directory**: (비워둠)
   - **Install Command**: `npm install`
   - "Deploy" 클릭

2. **환경 변수 설정** (배포 후에도 가능)
   - 프로젝트 페이지 → **Settings** → **Environment Variables**
   - 새 변수 추가:
     - **Key**: `OPENAI_API_KEY`
     - **Value**: `YOUR_OPENAI_API_KEY_HERE`
     - **Environment**: Production, Preview, Development 모두 선택
   - "Save" 클릭

3. **배포 확인**
   - 배포 완료 후 URL 확인 (예: `https://multiverse-if-backend.vercel.app`)
   - API 테스트:
     ```
     https://your-backend-url.vercel.app/api/generate-story
     ```

---

### Step 4: 프론트엔드 배포 (Vercel)

#### 4-1. 프론트엔드 프로젝트 설정

1. **새 프로젝트 생성**
   - Vercel 대시보드에서 "Add New..." → "Project"
   - 같은 GitHub 저장소 선택 (`multiverse-if`)
   - "Import" 클릭

2. **프로젝트 설정:**
   - **Framework Preset**: "Vite" 선택
   - **Root Directory**: `react-vite-app` 선택 (중요!)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `dist` (자동 설정됨)
   - **Install Command**: `npm install`

3. **환경 변수 설정:**
   - **Settings** → **Environment Variables**
   - 새 변수 추가:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://your-backend-url.vercel.app/api`
       - ⚠️ **위에서 배포한 백엔드 URL을 여기에 입력!**
     - **Environment**: Production, Preview, Development 모두 선택

4. **배포**
   - "Deploy" 클릭
   - 배포 완료 후 프론트엔드 URL 확인

---

## 🔄 업데이트 배포

코드를 수정한 후 배포하려면:

```bash
cd /Users/sirloin/Desktop/multiverse-if

# 변경사항 커밋
git add .
git commit -m "설명 메시지"

# GitHub에 푸시
git push origin main
```

Vercel이 자동으로 감지하여 재배포합니다!

---

## 📝 프로젝트별 URL 확인

배포 후 각 프로젝트의 URL은:
- **백엔드**: Vercel 대시보드 → 백엔드 프로젝트 → "Domains"에서 확인
- **프론트엔드**: Vercel 대시보드 → 프론트엔드 프로젝트 → "Domains"에서 확인

---

## 🧪 로컬 테스트

### 백엔드 로컬 테스트

```bash
cd backend

# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 로컬 개발 서버 실행
vercel dev
```

백엔드 API가 `http://localhost:3000/api/generate-story`에서 실행됩니다.

### 프론트엔드 로컬 테스트

```bash
cd react-vite-app

# .env.local 파일 확인 (이미 생성됨)
# VITE_API_BASE_URL=http://localhost:3000/api

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

---

## ✅ 배포 체크리스트

### 백엔드 배포
- [ ] GitHub 저장소 생성 및 코드 푸시
- [ ] Vercel에 백엔드 프로젝트 생성
- [ ] Root Directory를 `backend`로 설정
- [ ] `OPENAI_API_KEY` 환경 변수 설정
- [ ] 배포 완료 확인
- [ ] API URL 확인 및 저장

### 프론트엔드 배포
- [ ] Vercel에 프론트엔드 프로젝트 생성
- [ ] Root Directory를 `react-vite-app`으로 설정
- [ ] `VITE_API_BASE_URL` 환경 변수 설정 (백엔드 URL 사용)
- [ ] 배포 완료 확인
- [ ] 브라우저에서 테스트

---

## 🐛 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**
   - Vercel 대시보드 → 프로젝트 → "Deployments" → 실패한 배포 클릭
   - 로그에서 에러 확인

2. **환경 변수 확인**
   - Settings → Environment Variables에서 값 확인

3. **Root Directory 확인**
   - 백엔드: `backend`
   - 프론트엔드: `react-vite-app`

### API 호출 실패 시

1. **CORS 에러**
   - 백엔드 `api/generate-story/index.js`의 CORS 설정 확인

2. **404 에러**
   - 프론트엔드의 `VITE_API_BASE_URL` 확인
   - 백엔드 URL이 정확한지 확인

3. **500 에러**
   - OpenAI API 키 유효성 확인
   - Vercel 함수 로그 확인 (Functions 탭)

---

## 📚 참고 문서

- Vercel 공식 문서: https://vercel.com/docs
- OpenAI API 문서: https://platform.openai.com/docs
- 프로젝트 내 가이드:
  - `backend/README.md` - 백엔드 설명
  - `react-vite-app/IMPLEMENTATION_GUIDE.md` - 구현 가이드
  - `react-vite-app/PROMPT_GUIDE.md` - 프롬프트 수정 가이드


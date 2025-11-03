# API 키 설정 완료

## ✅ 로컬 개발 환경

`.env.local` 파일이 생성되었고 API 키가 설정되었습니다.

**중요**: 이 파일은 `.gitignore`에 포함되어 있어 Git에 푸시되지 않습니다.

### 로컬 테스트 방법

1. **Vercel CLI로 로컬 서버 실행**
   ```bash
   npm install -g vercel
   cd react-vite-app
   vercel dev
   ```
   
   이 경우 `.env.local`의 `OPENAI_API_KEY`가 자동으로 사용됩니다.

2. **프론트엔드 실행**
   ```bash
   npm run dev
   ```

---

## 🔐 Vercel 배포 시 환경 변수 설정

**반드시 Vercel 대시보드에서도 API 키를 설정해야 합니다!**

### 설정 방법:

1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 다음 변수 추가:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `YOUR_OPENAI_API_KEY_HERE`
   - **Environment**: Production, Preview, Development 모두 선택

### 배포 후 프론트엔드 환경 변수

프로젝트가 배포되면 (예: `https://your-project.vercel.app`):
- `.env.local` 파일에 `VITE_API_BASE_URL` 업데이트:
  ```
  VITE_API_BASE_URL=https://your-project.vercel.app/api
  ```
- 또는 Vercel 환경 변수로 설정 (빌드 시 반영)

---

## ⚠️ 보안 주의사항

1. **절대 Git에 커밋하지 마세요**
   - `.env.local` 파일은 이미 `.gitignore`에 포함되어 있습니다
   - API 키가 포함된 코드를 푸시하지 마세요

2. **API 키 노출 시**
   - OpenAI 대시보드에서 키 삭제
   - 새로운 키 발급
   - Vercel 환경 변수 업데이트

3. **로컬 파일 확인**
   - `.env.local` 파일이 Git에 포함되지 않는지 확인:
   ```bash
   git status
   ```
   - `env.local`이 목록에 없어야 합니다.

---

## 테스트

로컬에서 테스트하려면:

```bash
# 터미널 1: Vercel 개발 서버 (API 함수)
vercel dev

# 터미널 2: 프론트엔드
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하여 테스트 가능합니다.


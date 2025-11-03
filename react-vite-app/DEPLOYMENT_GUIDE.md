# 배포 가이드

## Vercel 배포 단계별 가이드

### 1. 준비사항

- [ ] OpenAI API 키 발급 완료
- [ ] GitHub 저장소에 코드 푸시 완료

### 2. Vercel 프로젝트 생성

1. https://vercel.com 에 접속
2. "Add New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `react-vite-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. 환경 변수 설정

Vercel 대시보드 → Settings → Environment Variables:

- **Key**: `OPENAI_API_KEY`
- **Value**: `YOUR_OPENAI_API_KEY_HERE` (OpenAI API 키)

프로덕션 환경에만 적용하도록 설정하거나, 모든 환경에 적용 가능.

### 4. API 함수 배포 확인

배포 후 다음 URL로 테스트:
```
https://your-project.vercel.app/api/generate-story
```

### 5. 프론트엔드 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_API_BASE_URL=https://your-project.vercel.app/api
```

또는 Vercel 대시보드에서 환경 변수로 설정 (빌드 시 반영됨)

### 6. 패키지 설치

Vercel은 자동으로 `package.json`을 확인하고 의존성을 설치합니다.
`api/generate-story/index.js`에서 사용하는 `openai` 패키지는 루트의 `package.json`에 추가해야 합니다.

**루트 `package.json`에 추가:**
```json
{
  "dependencies": {
    "openai": "^4.20.0"
  }
}
```

또는 프로젝트 루트에서:
```bash
npm install openai
```

### 7. 재배포

환경 변수나 코드 변경 후:
- Git에 푸시하면 자동 재배포
- 또는 Vercel 대시보드에서 "Redeploy"

---

## 프롬프트 수정 방법

프롬프트를 수정하려면:

1. `api/generate-story/index.js` 파일 열기
2. "프롬프트 작성 영역" 부분 수정
3. Git에 커밋 및 푸시
4. Vercel 자동 재배포

**예시:**
```javascript
// ========================================
// 프롬프트 작성 영역 - 여기를 수정하세요!
// ========================================
const prompt = `당신의 새로운 프롬프트...`;
// ========================================
// 프롬프트 작성 영역 끝
// ========================================
```

---

## 로컬 테스트 방법

### Vercel CLI 사용

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 루트에서 실행
vercel dev
```

로컬에서 `http://localhost:3000/api/generate-story`로 테스트 가능

### 환경 변수 설정

로컬 테스트 시 `.env.local` 파일 생성:
```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

---

## 문제 해결

### API 함수가 배포되지 않는 경우

- `api/` 폴더가 프로젝트 루트에 있는지 확인
- `api/generate-story/index.js` 파일 존재 확인
- Vercel 빌드 로그 확인

### CORS 에러

- `api/generate-story/index.js`의 CORS 헤더 확인
- 프론트엔드 도메인이 올바른지 확인

### API 키 오류

- Vercel 환경 변수 확인
- API 키 형식 확인 
- OpenAI 계정의 API 키 활성화 상태 확인

### 타임아웃 에러

- `vercel.json`의 `maxDuration` 설정 확인 (최대 60초)
- 프롬프트 길이 줄이기
- `max_tokens` 설정 확인

---

## 비용 관리

### 사용량 모니터링

- OpenAI 대시보드: https://platform.openai.com/usage
- Vercel 대시보드: Functions 탭에서 실행 시간 확인

### 비용 최적화 팁

1. **캐싱 활용**: 이미 구현됨 - 같은 입력에 대해 재요청 방지
2. **모델 선택**: `gpt-4o-mini` 사용 (더 저렴)
3. **max_tokens 제한**: 현재 1000으로 설정됨
4. **프롬프트 최적화**: 불필요한 내용 제거


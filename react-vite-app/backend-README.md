# 백엔드 API 구현 가이드

## 옵션 1: Vercel Serverless Functions (추천)

Vercel을 사용하면 서버리스 함수로 간단하게 구현할 수 있습니다.

### 설치

```bash
cd react-vite-app
npm install @vercel/node
```

### 프로젝트 구조

```
react-vite-app/
├── api/
│   └── generate-story/
│       └── index.js (또는 index.ts)
└── vercel.json
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### 환경 변수 설정

Vercel 대시보드에서 환경 변수 설정:
- `OPENAI_API_KEY` (ChatGPT 사용 시)
- 또는 `GOOGLE_API_KEY` (Gemini 사용 시)

---

## 옵션 2: Express 서버

간단한 Express 서버를 만들어 배포할 수 있습니다.

### 설치

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install openai # ChatGPT 사용 시
npm install @google/generative-ai # Gemini 사용 시
```

---

## AI API 선택 가이드

### ChatGPT (OpenAI) - 추천

**장점:**
- 한국어 지원 우수
- 자연스러운 스토리 생성
- API 안정성 높음

**단점:**
- 비용이 상대적으로 높음

**사용법:**
- API 키: https://platform.openai.com/api-keys
- 가격: 약 $0.002 / 1K tokens (입력), $0.006 / 1K tokens (출력)

### Gemini (Google)

**장점:**
- 무료 티어 제공 (제한적)
- 빠른 응답 속도
- Google AI Studio에서 테스트 가능

**단점:**
- 한국어 품질이 ChatGPT보다 낮을 수 있음

**사용법:**
- API 키: https://makersuite.google.com/app/apikey
- 무료 티어: 일일 60회 요청 제한

---

## 권장: ChatGPT 사용

더 자연스러운 한국어 스토리 생성을 위해 ChatGPT를 추천합니다.


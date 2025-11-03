# 멀티버스 이야기 생성 앱

AI를 활용하여 다른 멀티버스에서의 자신의 삶을 시각화하는 웹 애플리케이션입니다.

## 📁 프로젝트 구조

```
multiverse-if/
├── backend/              # 백엔드 (Vercel Serverless Functions)
│   ├── api/
│   │   └── generate-story/
│   │       └── index.js   # ChatGPT API 연동
│   ├── package.json
│   └── vercel.json
│
├── react-vite-app/       # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── pages/        # 5개 화면
│   │   ├── contexts/     # 상태 관리
│   │   └── utils/        # 유틸리티
│   └── package.json
│
└── examples/             # 참고 디자인 예제
```

## 🚀 빠른 시작

### 1. GitHub 저장소 생성 및 코드 푸시
- `VERCEL_DEPLOYMENT_GUIDE.md` 참고

### 2. Vercel 배포
- 백엔드와 프론트엔드를 각각 별도 프로젝트로 배포
- `VERCEL_DEPLOYMENT_GUIDE.md` 참고

## 📖 상세 가이드

- **배포 가이드**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **구현 가이드**: `react-vite-app/IMPLEMENTATION_GUIDE.md`
- **프롬프트 수정**: `react-vite-app/PROMPT_GUIDE.md`
- **API 키 설정**: `react-vite-app/API_KEY_SETUP.md`

## 🛠️ 기술 스택

- **프론트엔드**: React, Vite, React Router
- **백엔드**: Vercel Serverless Functions
- **AI**: OpenAI ChatGPT API
- **스토리지**: localStorage (브라우저)


# Backend API

Vercel Serverless Functions를 사용한 백엔드 API입니다.

## 구조

```
backend/
├── api/
│   └── generate-story/
│       └── index.js      # ChatGPT API를 사용한 이야기 생성 함수
├── package.json          # 의존성 관리
└── vercel.json          # Vercel 배포 설정
```

## 프롬프트 수정

프롬프트는 `api/generate-story/index.js` 파일의 "프롬프트 작성 영역"을 수정하세요.


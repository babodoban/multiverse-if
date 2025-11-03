# Vercel Dev 경로 오류 수정

## 문제
`backend` 폴더에서 `vercel dev` 실행 시:
```
Error: /Users/sirloin/Desktop/multiverse-if/backend/backend doesn't exist
```

경로가 중복되어 `backend/backend`로 인식되는 문제

## 원인
`.vercel/project.json` 파일에 `"root": "."` 설정이 있어서 경로가 중복됨

## 수정 사항

### `.vercel/project.json` 수정
```json
// 수정 전
{"projectId":"...","orgId":"...","projectName":"multiverse-if","root": "."}

// 수정 후
{"projectId":"...","orgId":"...","projectName":"multiverse-if"}
```

`root: "."` 설정을 제거했습니다.

## 확인 방법

```bash
cd backend
vercel dev
```

이제 정상적으로 작동해야 합니다.


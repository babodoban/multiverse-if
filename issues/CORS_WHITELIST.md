# CORS 허용 출처 목록

## 설정된 허용 출처

백엔드 API는 다음 출처에서의 요청만 허용합니다:

1. `https://multiverse-if.vercel.app`
2. `https://multiverse-if.apps.tossmini.com`
3. `https://multiverse-if.private-apps.tossmini.com`
4. `http://172.30.1.14:5713`

## 구현 방식

- 요청의 `Origin` 헤더를 확인
- 허용 목록에 있는 출처인 경우 해당 출처를 `Access-Control-Allow-Origin`에 설정
- 허용 목록에 없는 경우 기본값으로 첫 번째 허용 출처 사용

## 보안 고려사항

- 특정 출처만 허용하므로 보안이 강화됨
- `Access-Control-Allow-Credentials: true` 설정으로 쿠키/인증 정보 전송 가능
- 새로운 출처를 추가하려면 `allowedOrigins` 배열에 추가

## 새로운 출처 추가 방법

`backend/api/generate-story/index.js` 파일의 `allowedOrigins` 배열에 추가:

```javascript
const allowedOrigins = [
  'https://multiverse-if.vercel.app',
  'https://multiverse-if.apps.tossmini.com',
  'https://multiverse-if.private-apps.tossmini.com',
  'http://172.30.1.14:5713',
  // 새 출처 추가
  'https://new-origin.com',
];
```


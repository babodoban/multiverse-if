# React 버전 호환성 수정

## 문제
- `@apps-in-toss/web-framework` 패키지가 React 18을 요구
- 프로젝트는 React 19를 사용하여 peer dependency 충돌 발생
- Vercel 빌드 시 경고 발생

## 해결 방법
`@apps-in-toss/web-framework` 패키지를 유지하면서 React 버전을 18로 다운그레이드

### 변경 사항

#### package.json
- `react`: `^19.1.1` → `^18.2.0`
- `react-dom`: `^19.1.1` → `^18.2.0`
- `@types/react`: `^19.1.16` → `^18.2.0`
- `@types/react-dom`: `^19.1.9` → `^18.2.0`

#### granite.config.ts
- `build` 명령어: `tsc && vite build` → `vite build`
  - TypeScript 파일이 없어서 `tsc` 제거

#### .npmrc
- 생성 (필요시 `legacy-peer-deps=true` 옵션 사용 가능)

## 확인 사항
✅ 로컬 빌드 테스트 성공
✅ `@apps-in-toss/web-framework` 패키지 유지
✅ React 19 전용 기능 미사용 (코드 호환성 확인 완료)

## 다음 단계
변경사항을 GitHub에 푸시하면 Vercel이 자동으로 재배포합니다:
```bash
git push origin main
```

## 참고
- React 18과 19의 주요 차이는 새로운 Hook (`useFormState`, `useFormStatus`, `useOptimistic`) 등인데, 현재 프로젝트에서는 사용하지 않음
- `createRoot`는 React 18에서도 사용 가능


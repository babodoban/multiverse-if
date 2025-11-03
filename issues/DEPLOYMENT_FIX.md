# 배포 에러 수정 완료

## 문제
Vercel 프론트엔드 배포 시 React 19와 `@apps-in-toss/web-framework` 패키지 간 peer dependency 충돌 발생

## 해결 방법
1. **불필요한 패키지 제거**: `@apps-in-toss/web-framework` 제거 (소스 코드에서 사용하지 않음)
2. **스크립트 변경**: `granite dev/build` → `vite dev/build`
3. **설정 파일 정리**: `granite.config.ts` 삭제

## 변경 사항

### package.json
- `@apps-in-toss/web-framework` 의존성 제거
- `scripts` 변경:
  - `dev`: `granite dev` → `vite`
  - `build`: `granite build` → `vite build`
  - `deploy`: 제거 (불필요)

### 삭제된 파일
- `granite.config.ts` (사용하지 않음)

### 결과
- **제거된 패키지**: 1,271개
- **남은 패키지**: 211개
- **취약점**: 0개

## 다음 단계

변경사항을 GitHub에 푸시하면 Vercel이 자동으로 재배포합니다:

```bash
git add -A
git commit -m "Fix: Remove @apps-in-toss/web-framework"
git push origin main
```

재배포 후 경고 없이 빌드가 성공할 것입니다!


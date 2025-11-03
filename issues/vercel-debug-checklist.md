# Vercel 배포 디버깅 체크리스트

## 현재 상황

- 백엔드: `multiverse-if.vercel.app` (Functions 탭에 함수 없음)
- 프론트엔드: `multiverse-if-dpf1.vercel.app`
- Root Directory: 설정되지 않음 (이전에 문제가 있어 삭제)

## 확인해야 할 사항

### ✅ 1. Vercel 대시보드에서 확인

**백엔드 프로젝트** (`multiverse-if` 프로젝트):

1. **Settings → General**
   - [ ] Root Directory 확인
     - 현재: (비어있음)
     - 필요한 값: `backend`
   
2. **Settings → Build & Development Settings**
   - [ ] Build Command: (비어있어야 함)
   - [ ] Output Directory: (비어있어야 함)
   - [ ] Install Command: `npm install` 또는 (비어있어도 됨)
   - [ ] Node.js Version: 확인

3. **Deployments 탭**
   - [ ] 최신 배포 상태 확인
     - ✅ Ready: 정상
     - ❌ Error: 에러 로그 확인
   - [ ] 빌드 로그 확인
     - Functions 디렉토리를 찾는지 확인
     - 에러 메시지 확인

4. **Functions 탭**
   - [ ] `/api/generate-story` 함수가 있는지 확인
   - [ ] 없다면 왜 없는지 확인 (빌드 실패? 경로 문제?)

5. **Environment Variables**
   - [ ] `OPENAI_API_KEY` 환경 변수 확인
   - [ ] Production, Preview, Development 모두 설정되어 있는지 확인

### ✅ 2. 로컬에서 테스트

```bash
cd backend
vercel dev
```

- [ ] `http://localhost:3000/api/generate-story` 접속
- [ ] OPTIONS 요청 테스트:
  ```bash
  curl -X OPTIONS http://localhost:3000/api/generate-story \
    -H "Origin: https://multiverse-if-dpf1.vercel.app" \
    -v
  ```
- [ ] 정상 작동하는지 확인

### ✅ 3. 직접 API URL 테스트

브라우저에서:
```
https://multiverse-if.vercel.app/api/generate-story
```

또는 curl:
```bash
curl https://multiverse-if.vercel.app/api/generate-story
```

**예상 결과:**
- ✅ CORS 에러 또는 "Method not allowed" → 함수는 있지만 POST만 허용
- ❌ 404 Not Found → 함수가 없음

### ✅ 4. GitHub 저장소 확인

```bash
git ls-files | grep "backend/api"
```

- [ ] `backend/api/generate-story/index.js`가 커밋되어 있는지 확인
- [ ] `.gitignore`에 `backend`가 포함되어 있지 않은지 확인

### ✅ 5. Root Directory 설정 재시도

**Root Directory를 `backend`로 설정할 때 발생했던 문제:**

어떤 문제가 있었는지 알려주세요:
- [ ] 빌드 실패?
- [ ] 배포 실패?
- [ ] 경로 오류?
- [ ] 다른 에러 메시지?

**해결 방법:**
1. Root Directory를 `backend`로 설정
2. 저장
3. Deployments 탭에서 수동 재배포 (Redeploy)
4. 빌드 로그 확인
5. Functions 탭에서 함수 확인

## 추천 해결 순서

1. **GitHub에 코드가 올라가 있는지 확인**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Root Directory를 `backend`로 설정**
   - Settings → General → Root Directory: `backend`
   - 저장

3. **수동 재배포**
   - Deployments 탭 → 최신 배포의 "..." → Redeploy

4. **빌드 로그 확인**
   - 배포 중 "View Function Logs" 또는 "Build Logs" 확인
   - Functions 디렉토리를 찾는지 확인

5. **Functions 탭 확인**
   - 재배포 후 Functions 탭에서 `/api/generate-story` 확인

6. **직접 API 테스트**
   - `https://multiverse-if.vercel.app/api/generate-story`
   - 404가 아니라면 성공!


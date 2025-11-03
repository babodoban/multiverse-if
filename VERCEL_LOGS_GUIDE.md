# Vercel Functions 로그 확인 가이드

## 방법 1: Vercel 대시보드 (웹 브라우저)

### 단계별 안내

1. **Vercel 대시보드 접속**
   - https://vercel.com 에서 로그인
   - 또는 직접 프로젝트 URL로 이동

2. **프로젝트 선택**
   - 대시보드에서 `multiverse-if-backend` 프로젝트 클릭
   - (프로젝트명이 다를 수 있음)

3. **Functions 탭 이동**
   - 왼쪽 메뉴에서 **"Functions"** 클릭
   - 또는 상단 탭에서 **"Functions"** 선택

4. **특정 함수 선택**
   - 함수 목록에서 `/api/generate-story` 클릭
   - 또는 "View Function Logs" 버튼 클릭

5. **로그 확인**
   - 실시간 로그가 표시됩니다
   - `[CORS]` 태그로 필터링 가능
   - 타임스탬프와 함께 각 요청의 로그 확인

---

## 방법 2: Vercel CLI (터미널)

### 설치 (처음 한 번만)

```bash
npm install -g vercel
```

### 로그인

```bash
vercel login
```

### 로그 확인

```bash
# 프로젝트 디렉토리로 이동
cd backend

# 실시간 로그 확인
vercel logs

# 특정 함수 로그만 확인
vercel logs --follow

# 최근 100개 로그 확인
vercel logs --limit 100
```

---

## 방법 3: Vercel 대시보드 → Deployment → Functions

1. **Deployments 탭**
   - 프로젝트 페이지에서 **"Deployments"** 탭 클릭
   - 최신 배포 선택

2. **Functions 탭**
   - 배포 상세 페이지에서 **"Functions"** 클릭
   - 함수 목록에서 `/api/generate-story` 선택

3. **로그 확인**
   - 각 함수 실행에 대한 상세 로그 확인
   - 에러 메시지와 실행 시간 확인

---

## 로그에서 확인해야 할 항목

### 정상 작동 시
```
[CORS] ✅ Vercel preview 일치: https://multiverse-if-dpf1-... -> https://multiverse-if-dpf1-...
[CORS] OPTIONS 요청 처리: origin=..., allowedOrigin=...
```

### 문제 발생 시
```
[CORS] ❌ 출처 허용 실패: ...
[CORS] ⚠️ Origin 헤더가 없습니다.
```

### 요청 정보
```
[CORS] 요청 정보: {
  method: 'OPTIONS' 또는 'POST',
  origin: 'https://...',
  ...
}
```

---

## 디버깅 팁

1. **실시간 모니터링**
   - Vercel CLI: `vercel logs --follow`
   - 브라우저에서 Functions 탭에서 실시간 확인

2. **필터링**
   - 로그 검색: `[CORS]` 입력
   - 에러만 확인: 에러 필터 선택

3. **요청 추적**
   - 각 요청마다 타임스탬프 확인
   - OPTIONS와 POST 요청 순서 확인

---

## 일반적인 문제 해결

### 문제: 로그가 안 보임
- **해결**: 배포가 완료되었는지 확인
- **해결**: Functions 탭에서 올바른 함수 선택

### 문제: CORS 에러가 계속됨
- **해결**: 로그에서 `[CORS] ✅` 또는 `[CORS] ❌` 확인
- **해결**: 매칭 실패 원인 파악 후 코드 수정

### 문제: OPTIONS 요청이 처리되지 않음
- **해결**: 로그에서 `OPTIONS 요청 처리` 확인
- **해결**: 헤더가 올바르게 설정되었는지 확인

---

## 빠른 체크리스트

- [ ] Vercel 대시보드 접속
- [ ] 백엔드 프로젝트 선택
- [ ] Functions 탭 클릭
- [ ] `/api/generate-story` 함수 선택
- [ ] `[CORS]` 로그 확인
- [ ] OPTIONS 요청 로그 확인
- [ ] 에러 메시지 확인


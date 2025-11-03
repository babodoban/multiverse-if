# Vercel 404 NOT_FOUND 에러 해결

## 1. 제안된 수정 사항

### 문제
Vercel이 빌드 결과물을 찾지 못하거나 SPA 라우팅 설정이 없어서 404 에러 발생

### 해결 방법
1. **`vercel.json` 파일 생성** - SPA 라우팅 설정 추가
2. **Output Directory 설정** - `dist/web`로 명시
3. **Vite 빌드 출력 경로 설정** - `vite.config.js`에 `outDir` 추가

### 적용된 변경사항
- ✅ `react-vite-app/vercel.json` 생성
- ✅ `react-vite-app/vite.config.js` 수정 (outDir 설정)

---

## 2. 근본 원인 분석

### 실제 동작 vs 필요한 동작

**실제 동작:**
- `granite build`가 `dist/web/` 폴더에 빌드 결과물 생성
- Vercel이 `dist/` 폴더를 찾으려고 시도
- React Router의 클라이언트 사이드 라우팅 (`/basic-info`, `/scenario` 등) 접근 시 서버가 해당 경로를 찾지 못함

**필요한 동작:**
- Vercel이 `dist/web/` 폴더를 Output Directory로 인식
- 모든 경로(`/`, `/basic-info`, `/scenario` 등) 요청이 `index.html`로 리라이트되어 React Router가 처리

### 에러 발생 조건
1. **빌드 결과물 위치 불일치**
   - Vercel 설정: `dist` (기본값 또는 잘못된 설정)
   - 실제 빌드 결과물: `dist/web/`
   
2. **SPA 라우팅 미설정**
   - React Router는 클라이언트 사이드 라우팅을 사용
   - `/basic-info` 같은 경로를 직접 요청하면 서버가 해당 파일을 찾으려고 함
   - 서버에는 `index.html`만 있고 `/basic-info.html` 파일은 없음

### 오해와 간과 사항
- ❌ **오해**: Vercel이 자동으로 SPA 라우팅을 처리한다고 생각
- ❌ **간과**: `granite build`가 여러 플랫폼을 빌드하여 `dist/web/`에 결과물 생성
- ❌ **간과**: Vercel 설정에서 Output Directory를 명시하지 않음

---

## 3. 개념 이해

### 왜 이 에러가 존재하는가?

**SPA (Single Page Application)의 특성:**
- React Router 같은 클라이언트 사이드 라우터는 브라우저에서 JavaScript로 라우팅 처리
- 서버는 항상 `index.html`만 제공하고, React가 URL을 해석하여 컴포넌트 렌더링
- 하지만 서버는 실제로 `/basic-info` 경로에 대한 요청을 받으면 해당 경로의 파일을 찾으려고 함

**Vercel의 보호 메커니즘:**
- 404 에러는 "존재하지 않는 파일을 요청했다"는 의미
- 이는 잘못된 경로로 접근했거나 라우팅 설정이 없다는 것을 알려줌
- 보안상으로는 잘못된 경로 요청을 차단하는 역할

### 올바른 정신 모델

**전통적인 웹사이트:**
```
/basic-info → basic-info.html 파일이 존재
/scenario → scenario.html 파일이 존재
```

**SPA (React Router 사용):**
```
/basic-info → index.html (React Router가 처리)
/scenario → index.html (React Router가 처리)
```

**Vercel의 Rewrite 규칙:**
- 모든 요청을 `index.html`로 리다이렉트
- 브라우저가 `index.html` 로드
- React Router가 URL을 읽고 적절한 컴포넌트 렌더링

### 프레임워크/언어 설계에서의 위치

**Vercel의 설계 원칙:**
- 정적 파일 서빙이 기본 (최적화된 CDN)
- SPA를 지원하려면 명시적 설정 필요 (`rewrites`)
- 이는 보안과 성능을 위한 설계 선택

**React Router의 설계:**
- 클라이언트 사이드 라우팅 (서버 라운드트립 없음)
- 브라우저 히스토리 API 사용
- 서버 설정이 필요한 경우가 많음

---

## 4. 경고 징후 인식

### 이 문제를 다시 일으킬 수 있는 패턴

**빌드 도구 변경 시:**
- ✅ `granite` → `vite` 직접 사용 시 `dist`에 빌드됨
- ✅ 다른 빌드 도구 사용 시 출력 경로 확인 필요

**Vercel 설정 실수:**
- ❌ Output Directory를 설정하지 않음
- ❌ 잘못된 Output Directory 설정
- ❌ `vercel.json`이 없거나 잘못된 설정

**라우팅 변경 시:**
- ❌ 새 라우트 추가 후 `vercel.json` 업데이트 안 함
- ❌ 서버 사이드 라우팅으로 전환 시 기존 설정 유지

### 관련된 유사한 실수

1. **빌드 스크립트 변경**
   - `npm run build` 명령어가 다른 출력 경로 생성
   - 해결: `vercel.json`의 `outputDirectory` 업데이트

2. **프레임워크 전환**
   - Next.js, SvelteKit 등 다른 프레임워크 사용 시
   - 각 프레임워크의 고유한 라우팅 방식 이해 필요

3. **환경 변수 설정**
   - 빌드 시점과 런타임 시점의 차이
   - `VITE_` 접두사 사용 여부

### 코드 냄새나 패턴

**빌드 결과물 확인:**
```bash
# 항상 빌드 후 출력 경로 확인
npm run build
ls -la dist/  # 또는 dist/web/
```

**테스트 절차:**
```bash
# 로컬에서 빌드 결과물 확인
npm run build
npm run preview
# 브라우저에서 /basic-info 같은 경로 테스트
```

---

## 5. 대안 및 트레이드오프

### 방법 1: `vercel.json` 사용 (현재 방법) ✅

**장점:**
- 명시적이고 명확함
- Git으로 버전 관리 가능
- 팀원 모두 같은 설정 사용

**단점:**
- 추가 파일 필요
- 설정 복잡도 약간 증가

### 방법 2: Vercel 대시보드 설정

**장점:**
- 코드 변경 없음
- 빠른 설정

**단점:**
- Git에 추적되지 않음
- 팀원 간 설정 불일치 가능
- 배포 환경마다 다를 수 있음

### 방법 3: Next.js 같은 프레임워크 사용

**장점:**
- 자동으로 서버 사이드 라우팅 처리
- 파일 기반 라우팅

**단점:**
- 기존 코드 재작성 필요
- 학습 곡선

### 방법 4: 정적 라우팅 (각 페이지마다 HTML 파일)

**장점:**
- 서버 설정 불필요
- SEO 친화적

**단점:**
- 빌드 시간 증가
- 코드 중복 가능성
- React Router의 이점 포기

---

## 체크리스트

배포 전 확인사항:

- [ ] `vercel.json` 파일 존재
- [ ] `outputDirectory`가 실제 빌드 출력 경로와 일치
- [ ] `rewrites` 규칙이 모든 SPA 경로를 `index.html`로 리다이렉트
- [ ] 로컬에서 `npm run build` 후 출력 경로 확인
- [ ] Vercel 대시보드에서 Output Directory 설정 확인
- [ ] 배포 후 루트 경로(`/`) 접근 테스트
- [ ] 배포 후 서브 경로(`/basic-info` 등) 접근 테스트

---

## 다음 단계

1. 변경사항 커밋 및 푸시
2. Vercel 자동 재배포 확인
3. 배포 후 URL 테스트:
   - `https://your-project.vercel.app/`
   - `https://your-project.vercel.app/basic-info`
   - `https://your-project.vercel.app/scenario`


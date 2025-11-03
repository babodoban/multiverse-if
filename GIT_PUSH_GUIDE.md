# GitHub 푸시 가이드

## 현재 상태

✅ Git 저장소 초기화 완료
✅ 모든 파일 커밋 완료
✅ GitHub 원격 저장소 연결 완료 (`https://github.com/babodoban/multiverse-if`)

## 다음 단계: GitHub에 푸시하기

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/sirloin/Desktop/multiverse-if
git push -u origin main
```

## 인증 방법

### 방법 1: Personal Access Token (권장)

1. **GitHub에서 토큰 생성**
   - https://github.com/settings/tokens 접속
   - "Generate new token" → "Generate new token (classic)"
   - Note: `multiverse-if-push` (임의 이름)
   - Expiration: `No expiration` 또는 원하는 기간
   - Scopes: `repo` 체크
   - "Generate token" 클릭
   - ⚠️ **생성된 토큰을 복사해두세요! (한 번만 표시됩니다)**

2. **토큰으로 푸시**
   ```bash
   git push -u origin main
   ```
   <!-- - Username: `babodoban` -->
   - Password: **위에서 생성한 Personal Access Token 입력**

### 방법 2: SSH 키 사용

1. **SSH 키 생성** (아직 없다면)
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **SSH 키를 GitHub에 등록**
   - https://github.com/settings/keys 접속
   - "New SSH key" 클릭
   - `~/.ssh/id_ed25519.pub` 파일 내용 복사 후 등록

3. **원격 저장소 URL을 SSH로 변경**
   ```bash
   git remote set-url origin git@github.com:babodoban/multiverse-if.git
   ```

4. **푸시**
   ```bash
   git push -u origin main
   ```

### 방법 3: GitHub CLI 사용

```bash
# GitHub CLI 설치 (Homebrew)
brew install gh

# GitHub 로그인
gh auth login

# 푸시
git push -u origin main
```

---

## 확인

푸시가 성공하면:
- https://github.com/babodoban/multiverse-if 에서 코드 확인 가능
- 다음 단계: Vercel 배포 진행


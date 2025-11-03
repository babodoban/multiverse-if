# 프롬프트 수정 가이드

## 프롬프트 위치

프롬프트는 다음 파일에 있습니다:
```
api/generate-story/index.js
```

## 수정 방법

1. `api/generate-story/index.js` 파일을 엽니다
2. 다음 부분을 찾아서 수정합니다:

```javascript
// ========================================
// 프롬프트 작성 영역 - 여기를 수정하세요!
// ========================================
const prompt = `당신은 멀티버스 이야기를 생성하는 창작자입니다.

현재 멀티버스의 정보:
- 직업: ${basicInfo.job || '정보 없음'}
- 성별: ${basicInfo.gender || '정보 없음'}
- 관심사: ${basicInfo.interests || '정보 없음'}
- 연애상태: ${basicInfo.relationship || '정보 없음'}
- 자녀: ${basicInfo.children || '정보 없음'}

중요한 순간:
${scenario.importantMoment}

대안 선택 (만약 내가 그 때 ... 했다면):
${scenario.alternativeChoice}

위 정보를 바탕으로 다른 멀티버스에서의 삶을 상세하고 감성적으로 묘사해주세요. 
다음 형식의 JSON으로 응답해주세요:

{
  "job": "다른 멀티버스에서의 직업",
  "location": "살고 있는 장소 (국가, 도시)",
  "relationship": "연애상태에 대한 구체적인 설명 (2-3문장)",
  "story": "300-500자 정도의 자세한 이야기"
}`;
// ========================================
// 프롬프트 작성 영역 끝
// ========================================
```

## 프롬프트 작성 팁

### 1. 사용 가능한 변수
- `${basicInfo.job}` - 직업
- `${basicInfo.gender}` - 성별
- `${basicInfo.interests}` - 관심사
- `${basicInfo.relationship}` - 연애상태
- `${basicInfo.children}` - 자녀
- `${scenario.importantMoment}` - 중요한 순간
- `${scenario.alternativeChoice}` - 대안 선택

### 2. 응답 형식
반드시 다음 JSON 형식으로 응답해야 합니다:
```json
{
  "job": "...",
  "location": "...",
  "relationship": "...",
  "story": "..."
}
```

### 3. 프롬프트 최적화 팁
- 명확한 지시사항 제공
- 원하는 스타일 명시 (감성적, 현실적, 판타지 등)
- 응답 길이 지정 (예: 300-500자)
- JSON 형식 강제 (시스템 메시지에도 포함됨)

### 4. 예시 프롬프트
```javascript
const prompt = `당신은 창의적인 스토리텔러입니다.

사용자 정보:
직업: ${basicInfo.job}
성별: ${basicInfo.gender}
관심사: ${basicInfo.interests}
연애상태: ${basicInfo.relationship}

과거 선택의 순간:
${scenario.importantMoment}

다른 선택:
${scenario.alternativeChoice}

위 정보를 바탕으로, 만약 그 선택을 했다면 어떤 삶을 살았을지 상세하게 묘사해주세요.
현실적이면서도 희망적인 톤으로 작성해주세요.

JSON 형식으로 응답:
{
  "job": "새로운 직업",
  "location": "국가, 도시",
  "relationship": "연애상태 설명",
  "story": "상세한 이야기 (400-600자)"
}`;
```

## 수정 후 배포

프롬프트를 수정한 후:
1. Git에 커밋 및 푸시
2. Vercel 자동 재배포 또는 수동 재배포
3. 배포 후 테스트

## 주의사항

1. **JSON 형식 필수**: 응답은 반드시 JSON 형식이어야 합니다
2. **변수 사용**: `${variable}` 형식으로 변수를 사용할 수 있습니다
3. **이스케이프 처리**: 백틱(`) 내에서 `${}` 사용 시 변수로 인식되므로 주의
4. **길이 제한**: 너무 긴 프롬프트는 토큰 사용량 증가 → 비용 증가


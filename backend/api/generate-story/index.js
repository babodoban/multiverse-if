/**
 * Vercel Serverless Function - ChatGPT API 사용
 * 
 * 배포 방법:
 * 1. Vercel에 프로젝트 연결
 * 2. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수 설정
 * 3. 자동 배포 완료
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { basicInfo, scenario } = req.body || {};

    // 입력 검증
    if (!basicInfo || !scenario) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ========================================
    // 💫 IF 멀티버스 프롬프트 v1.2 (업데이트 반영)
    // ========================================
    const prompt = `
당신은 사용자의 인생이 다른 선택을 했을 때의 "평행우주 버전의 나"를 상상해 서사적으로 표현하는 AI 이야기꾼입니다.

사용자가 제공한 기본 정보와 인생의 선택 시나리오를 바탕으로,
감정적으로 몰입감 있고 현실적인 "또 다른 나"의 이야기를 만들어주세요.

결과는 리얼리티와 드라마성의 균형, 감정선의 깊이, 멀티버스적 상상력을 모두 포함해야 합니다.
톤은 따뜻하고 영화적이며, 현실적인 디테일과 약간의 낭만을 함께 담습니다.
문체는 자연스럽게 1인칭("나는 ~했다") 또는 관찰자 시점("그는 ~하고 있었다") 중 선택하세요.

---

[기본정보]
- 직업: ${basicInfo.job || '정보 없음'}
- 성별: ${basicInfo.gender || '정보 없음'}
- 관심사: ${basicInfo.interests || '정보 없음'}
- 나를 한 줄 요약: ${basicInfo.summary || '정보 없음'}
- 연애상태: ${basicInfo.relationship || '정보 없음'}
- 자녀: ${basicInfo.children || '정보 없음'}

[시나리오]
- 중요한 순간: ${scenario.importantMoment || '정보 없음'}
- 선택내용: ${scenario.alternativeChoice || '정보 없음'}
- 그 때 생각 한 줄: ${scenario.thoughtAtThatTime || '정보 없음'}

---

다음 형식의 JSON으로 응답하세요:

{
  "multiverse_name": "Reality_### : [짧고 인상적인 별칭]",
  "job": "다른 우주에서의 직업",
  "location": "활동 무대 또는 거주지",
  "relationship": "짧은 문장으로 관계의 분위기 설명",
  "summary": "멀티버스의 나를 요약하는 감정적 문장",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "story": "현실적이면서 감정적으로 풍부한 서사 — 약 5~10문장",
  "message_to_current_self": "짧지만 여운이 남는 한두 문장"
}`;

    // ========================================
    // ChatGPT API 호출
    // ========================================
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 고품질 결과를 원할 경우 gpt-5 / 비용 절감 시 gpt-4o-mini
      messages: [
        {
          role: 'system',
          content:
            '당신은 감정적으로 몰입감 있는 스토리텔러입니다. 사용자의 인생 선택을 바탕으로 멀티버스 이야기를 생성합니다. 반드시 JSON 형식으로만 응답하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    const result = JSON.parse(responseText);

    // 키워드가 배열인 경우 문자열로 변환
    let keywords = '';
    if (Array.isArray(result.keywords)) {
      keywords = result.keywords.join(', ');
    } else if (typeof result.keywords === 'string') {
      keywords = result.keywords;
    }

    // 필드명 변환 (snake_case -> camelCase) 및 프론트엔드 형식에 맞춤
    const formattedResult = {
      multiverseName: result.multiverse_name || result.multiverseName || '',
      job: result.job || '',
      location: result.location || '',
      relationship: result.relationship || '',
      summary: result.summary || '',
      keywords: keywords,
      story: result.story || '',
      message: result.message_to_current_self || result.message || '',
    };

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({
      error: 'Failed to generate story',
      message: error.message,
    });
  }
}
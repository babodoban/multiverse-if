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
  // 허용된 출처 목록 (정확히 일치)
  const allowedOrigins = [
    'https://multiverse-if.vercel.app',
    'https://multiverse-if.apps.tossmini.com',
    'https://multiverse-if.private-apps.tossmini.com',
    'http://172.30.1.14:5713',
  ];

  // 요청 출처 확인
  const origin = req.headers.origin || req.headers.referer;
  let allowedOrigin = null;

  // 출처가 허용 목록에 있는지 확인
  if (origin) {
    try {
      // referer에서 origin 추출 (필요시)
      let originToCheck = origin;
      if (origin.startsWith('http')) {
        const originUrl = new URL(origin);
        originToCheck = `${originUrl.protocol}//${originUrl.host}`;
      }
      
      // 1. 정확히 일치하는 출처 확인
      if (allowedOrigins.includes(originToCheck) || allowedOrigins.includes(origin)) {
        allowedOrigin = originToCheck || origin;
        console.log(`[CORS] 정확 일치: ${origin} -> ${allowedOrigin}`);
      }
      // 2. Vercel preview 배포 패턴 확인 (multiverse-if-*.vercel.app)
      else if (originToCheck.includes('multiverse-if') && originToCheck.includes('.vercel.app')) {
        // Vercel preview URL 허용
        allowedOrigin = originToCheck;
        console.log(`[CORS] Vercel preview 일치: ${origin} -> ${allowedOrigin}`);
      }
      // 3. 전체 origin 문자열이 목록에 있는 경우
      else if (allowedOrigins.includes(origin)) {
        allowedOrigin = origin;
        console.log(`[CORS] 전체 문자열 일치: ${origin}`);
      }
      // 매칭 실패
      else {
        console.log(`[CORS] 출처 허용 실패: ${origin} (originToCheck: ${originToCheck})`);
      }
    } catch (e) {
      console.error(`[CORS] URL 파싱 실패: ${origin}`, e);
      // URL 파싱 실패 시 origin 문자열 그대로 비교
      if (allowedOrigins.includes(origin)) {
        allowedOrigin = origin;
      } else if (origin && origin.includes('multiverse-if') && origin.includes('.vercel.app')) {
        // Vercel preview URL 허용
        allowedOrigin = origin;
        console.log(`[CORS] Vercel preview 일치 (파싱 실패 후): ${origin}`);
      }
    }
  } else {
    console.log('[CORS] Origin 헤더가 없습니다.');
  }

  // CORS 헤더 설정 (매칭된 출처 또는 요청한 출처, 또는 기본값)
  const corsOrigin = allowedOrigin || origin || allowedOrigins[0];
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24시간
    'Access-Control-Allow-Credentials': 'true',
  };

  // 모든 응답에 CORS 헤더 추가 (반드시 OPTIONS 처리 전에 설정)
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  // OPTIONS 요청 (Preflight) 처리 - 가장 먼저 처리
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS 요청 처리: origin=${origin}, allowedOrigin=${corsOrigin}`);
    // 명시적으로 헤더 다시 설정
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // req.body 파싱 (Vercel에서는 자동 파싱되지만 명시적으로 확인)
  if (!req.body) {
    res.status(400).json({ error: 'Request body is missing' });
    return;
  }

  try {
    const { basicInfo, scenario } = req.body || {};

    // 입력 검증
    if (!basicInfo || !scenario) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
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
    
    // 에러 응답에도 CORS 헤더 포함 (이미 함수 시작 부분에서 설정됨)
    res.status(500).json({
      error: 'Failed to generate story',
      message: error.message,
    });
    return;
  }
}
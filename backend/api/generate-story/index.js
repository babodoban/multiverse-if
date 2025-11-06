/**
 * Vercel Serverless Function - OpenAI API를 사용한 멀티버스 이야기 생성
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
  // ============================================
  // 1. Origin 확인 및 CORS 헤더 설정
  // ============================================
  const origin = req.headers.origin || '';
  const method = req.method || '';
  
  // 로깅 (디버깅용)
  console.log(`[CORS] 요청 도달: method=${method}, origin=${origin || 'none'}`);
  
  // 허용할 Origin 결정
  let allowedOrigin = '*';
  
  // localhost 개발 환경 허용 (포트 번호 포함)
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    allowedOrigin = origin;
    console.log(`[CORS] ✅ localhost 허용: ${origin}`);
  }
  // Vercel 도메인 허용 (모든 vercel.app 도메인)
  else if (origin && origin.includes('vercel.app')) {
    allowedOrigin = origin;
    console.log(`[CORS] ✅ Vercel 도메인 허용: ${origin}`);
  }
  // multiverse-if 포함 도메인 허용
  else if (origin && origin.includes('multiverse-if')) {
    allowedOrigin = origin;
    console.log(`[CORS] ✅ multiverse-if 도메인 허용: ${origin}`);
  }
  // 프로덕션 도메인 허용
  else if (origin && origin.includes('tossmini.com')) {
    allowedOrigin = origin;
    console.log(`[CORS] ✅ tossmini.com 도메인 허용: ${origin}`);
  }
  // 그 외는 * 허용 (웹뷰 환경 등)
  else {
    console.log(`[CORS] ⚠️ 알 수 없는 origin, * 허용: ${origin || 'none'}`);
  }
  
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  // ============================================
  // 2. OPTIONS 요청 (Preflight) 처리 - 가장 먼저!
  // ============================================
  if (method === 'OPTIONS') {
    console.log(`[CORS] ✅ OPTIONS 요청 처리: origin=${origin}, allowedOrigin=${allowedOrigin}`);
    console.log(`[CORS] OPTIONS 헤더:`, corsHeaders);
    
    // OPTIONS 요청에 대해 CORS 헤더를 명시적으로 설정하고 응답
    // Vercel에서는 writeHead가 더 확실하게 작동함
    try {
      res.writeHead(200, corsHeaders);
      res.end();
      console.log(`[CORS] ✅ OPTIONS 응답 전송 완료`);
      return;
    } catch (error) {
      console.error(`[CORS] ❌ OPTIONS 응답 실패:`, error);
      // 대체 방법 시도
      Object.keys(corsHeaders).forEach((key) => {
        res.setHeader(key, corsHeaders[key]);
      });
      res.status(200).end();
      return;
    }
  }
  
  // ============================================
  // 3. 모든 응답에 CORS 헤더 추가
  // ============================================
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });
  
  // ============================================
  // 4. POST 요청만 허용
  // ============================================
  if (method !== 'POST') {
    console.log(`[CORS] ❌ Method not allowed: ${method}`);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // ============================================
  // 5. 요청 본문 검증
  // ============================================
  const { basicInfo, scenario } = req.body || {};
  
  if (!basicInfo || !scenario) {
    console.log(`[CORS] ❌ Missing required fields`);
    res.status(400).json({ error: 'Missing required fields: basicInfo and scenario are required' });
    return;
  }
  
  console.log(`[CORS] ✅ POST 요청 처리 시작`);
  
  // ============================================
  // 6. OpenAI API 호출
  // ============================================
  try {
    // 프롬프트 생성
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
  "multiverse_name": "[특징을 담은 영어단어]_### : [한글로 짧고 인상적인 별칭]",
  "job": "다른 우주에서의 직업",
  "location": "활동 무대 또는 거주지 정보로 국가, 도시 의 형태",
  "relationship": "이성과의 연애 상태(결혼유무, 자녀유무 등)에 대해 분위기와 함께 설명",
  "summary": "멀티버스의 나를 요약하는 감정적 문장",
  "keywords": ["#키워드1", "#키워드2", "#키워드3"],
  "story": "현실적이면서 감정적으로 풍부한 서사를 약 10 ~ 15 문장으로 작성",
  "message_to_current_self": "스스로에게 편지 보내듯이 친근하고 애정있는 말투로, 짧지만 여운이 남는 한두 문장"
}`;

    // OpenAI API 호출
    console.log(`[OpenAI] API 호출 시작`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 감정적으로 몰입감 있는 스토리텔러입니다. 사용자의 인생 선택을 바탕으로 멀티버스 이야기를 생성합니다. 반드시 JSON 형식으로만 응답하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
    
    console.log(`[OpenAI] ✅ API 호출 성공`);
    
    // 응답 파싱
    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('OpenAI 응답이 비어있습니다.');
    }
    
    const result = JSON.parse(responseText);
    
    // 키워드 배열을 문자열로 변환
    let keywords = '';
    if (Array.isArray(result.keywords)) {
      keywords = result.keywords.join(', ');
    } else if (typeof result.keywords === 'string') {
      keywords = result.keywords;
    }
    
    // 프론트엔드 형식에 맞게 변환
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
    
    // 성공 응답
    console.log(`[CORS] ✅ 성공 응답 전송`);
    res.status(200).json(formattedResult);
    
  } catch (error) {
    console.error('[Error] ❌ Story generation error:', error);
    
    // 에러 타입별 처리
    let statusCode = 500;
    let errorMessage = '이야기 생성에 실패했습니다. 잠시 후 다시 시도해주세요.';
    
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        statusCode = 429;
        errorMessage = 'OpenAI API 할당량이 초과되었습니다. 관리자에게 문의해주세요.';
      } else if (status === 401) {
        statusCode = 401;
        errorMessage = 'OpenAI API 인증에 실패했습니다. 관리자에게 문의해주세요.';
      }
    }
    
    console.log(`[CORS] ❌ 에러 응답 전송: statusCode=${statusCode}`);
    res.status(statusCode).json({
      error: error.message || 'Failed to generate story',
      message: errorMessage,
    });
  }
}

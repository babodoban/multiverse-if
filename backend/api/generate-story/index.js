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
    // 로컬 개발 환경
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    // 파일 프로토콜 (앱 웹뷰에서 사용 가능)
    'file://',
    'null', // 웹뷰에서 origin이 null일 수 있음
  ];

  // 요청 출처 확인
  const origin = req.headers.origin || req.headers.referer;
  let allowedOrigin = null;

  // 디버깅: 모든 헤더 로깅
  console.log('[CORS] 요청 정보:', {
    method: req.method,
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    headers: Object.keys(req.headers),
    allHeaders: req.headers, // 모든 헤더 출력 (디버깅용)
  });

  // 출처가 허용 목록에 있는지 확인
  if (origin) {
    try {
      // referer에서 origin 추출 (필요시)
      let originToCheck = origin;
      if (origin.startsWith('http')) {
        try {
          const originUrl = new URL(origin);
          originToCheck = `${originUrl.protocol}//${originUrl.host}`;
          // port가 있으면 포함
          if (originUrl.port) {
            originToCheck = `${originUrl.protocol}//${originUrl.host}:${originUrl.port}`;
          }
        } catch (e) {
          // URL 파싱 실패 시 원본 origin 사용
          console.log(`[CORS] URL 파싱 시도 실패, 원본 사용: ${origin}`);
          originToCheck = origin;
        }
      }
      
      // 1. 정확히 일치하는 출처 확인
      if (allowedOrigins.includes(originToCheck) || allowedOrigins.includes(origin)) {
        allowedOrigin = originToCheck || origin;
        console.log(`[CORS] ✅ 정확 일치: ${origin} -> ${allowedOrigin}`);
      }
      // 2. 로컬 개발 환경 확인 (localhost, 127.0.0.1)
      else if (originToCheck.includes('localhost') || originToCheck.includes('127.0.0.1')) {
        // 로컬 개발 환경 허용
        allowedOrigin = originToCheck;
        console.log(`[CORS] ✅ 로컬 개발 환경 일치: ${origin} -> ${allowedOrigin}`);
      }
      // 3. Vercel preview 배포 패턴 확인 (모든 multiverse-if 관련 vercel.app 도메인)
      // origin이 'multiverse-if'를 포함하고 '.vercel.app'을 포함하는 경우 모두 허용
      // 예: https://multiverse-if-dpf1.vercel.app, https://multiverse-if-abc123.vercel.app 등
      const isVercelPreview = 
        (originToCheck && originToCheck.includes('multiverse-if') && originToCheck.includes('.vercel.app')) ||
        (origin && origin.includes('multiverse-if') && origin.includes('.vercel.app'));
      
      if (isVercelPreview) {
        // Vercel preview URL 허용 (multiverse-if가 포함된 모든 vercel.app 도메인)
        // 원본 origin을 그대로 사용 (브라우저가 요청한 정확한 origin)
        allowedOrigin = origin;
        console.log(`[CORS] ✅ Vercel preview 일치: ${origin} -> ${allowedOrigin}`);
      }
      // 4. 파일 프로토콜 또는 null origin (앱 웹뷰)
      else if (originToCheck === 'file://' || origin === 'null' || !origin) {
        // 앱 웹뷰 환경에서는 origin이 없거나 null일 수 있음
        allowedOrigin = origin || '*'; // null이면 * 사용
        console.log(`[CORS] ✅ 앱 웹뷰 환경 허용: ${origin || 'null'} -> ${allowedOrigin}`);
      }
      // 5. 전체 origin 문자열이 목록에 있는 경우
      else if (allowedOrigins.includes(origin)) {
        allowedOrigin = origin;
        console.log(`[CORS] ✅ 전체 문자열 일치: ${origin}`);
      }
      // 매칭 실패
      else {
        console.log(`[CORS] ❌ 출처 허용 실패: ${origin} (originToCheck: ${originToCheck})`);
        console.log(`[CORS] 허용 목록:`, allowedOrigins);
        console.log(`[CORS] multiverse-if 포함: ${originToCheck.includes('multiverse-if')}`);
        console.log(`[CORS] vercel.app 포함: ${originToCheck.includes('.vercel.app')}`);
      }
    } catch (e) {
      console.error(`[CORS] ❌ URL 파싱 실패: ${origin}`, e);
      // URL 파싱 실패 시 origin 문자열 그대로 비교
      if (allowedOrigins.includes(origin)) {
        allowedOrigin = origin;
        console.log(`[CORS] ✅ 전체 문자열 일치 (파싱 실패 후): ${origin}`);
      } else if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        // 로컬 개발 환경 허용
        allowedOrigin = origin;
        console.log(`[CORS] ✅ 로컬 개발 환경 일치 (파싱 실패 후): ${origin}`);
      } else if (origin && (origin.includes('multiverse-if') && origin.includes('.vercel.app'))) {
        // Vercel preview URL 허용 (파싱 실패 후에도 체크)
        allowedOrigin = origin;
        console.log(`[CORS] ✅ Vercel preview 일치 (파싱 실패 후): ${origin}`);
      } else if (origin === 'null' || !origin || origin === 'file://') {
        // 앱 웹뷰 환경 처리 (파싱 실패 후에도 체크)
        allowedOrigin = '*';
        console.log(`[CORS] ✅ 앱 웹뷰 환경 허용 (파싱 실패 후): ${origin || 'null'} -> *`);
      } else {
        console.log(`[CORS] ❌ 매칭 실패 (파싱 실패): ${origin}`);
      }
    }
  } else {
    console.log('[CORS] ⚠️ Origin 헤더가 없습니다.');
    // Origin이 없으면 앱 웹뷰 환경일 가능성이 높음
    allowedOrigin = '*';
    console.log('[CORS] ✅ Origin 없음 - 앱 웹뷰 환경으로 간주하여 * 허용');
  }

  // CORS 헤더 설정 (매칭된 출처 또는 요청한 출처, 또는 기본값)
  // 앱 웹뷰 환경에서는 origin이 없거나 null일 수 있음
  const corsOrigin = allowedOrigin || (origin && origin !== 'null' ? origin : '*') || '*';
  
  // Access-Control-Allow-Credentials가 true일 때는 *를 사용할 수 없으므로
  // origin이 없거나 null인 경우 credentials를 false로 설정하거나 구체적인 origin 사용
  const useCredentials = corsOrigin !== '*';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24시간
    ...(useCredentials ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
  };

  // 모든 응답에 CORS 헤더 추가 (반드시 OPTIONS 처리 전에 설정)
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  // OPTIONS 요청 (Preflight) 처리 - 가장 먼저 처리
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS 요청 처리: origin=${origin}, allowedOrigin=${corsOrigin}`);
    console.log(`[CORS] OPTIONS CORS 헤더:`, corsHeaders);
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
  "multiverse_name": "[특징을 담은 영어단어]_### : [한글로 짧고 인상적인 별칭]",
  "job": "다른 우주에서의 직업",
  "location": "활동 무대 또는 거주지 정보로 국가, 도시 의 형태",
  "relationship": "이성과의 연애 상태(결혼유무, 자녀유무 등)에 대해 분위기와 함께 설명",
  "summary": "멀티버스의 나를 요약하는 감정적 문장",
  "keywords": ["#키워드1", "#키워드2", "#키워드3"],
  "story": "현실적이면서 감정적으로 풍부한 서사를 약 10 ~ 15 문장으로 작성",
  "message_to_current_self": "스스로에게 편지 보내듯이 친근하고 애정있는 말투로, 짧지만 여운이 남는 한두 문장"
}`;

    // ========================================
    // ChatGPT API 호출 (Fallback 전략: gpt-5 -> gpt-4o)
    // ========================================
    // 시도 순서: gpt-5 기본 사용, 실패 시 gpt-4o로 자동 전환
    const models = ['gpt-5', 'gpt-4o'];
    
    let completion = null;
    let lastError = null;
    let usedModel = null;
    
    for (const model of models) {
      try {
        const isGpt5 = model.includes('gpt-5') || model.includes('o1');
        
        console.log(`[OpenAI] 모델 시도: ${model}`);
        
        completion = await openai.chat.completions.create({
          model: model,
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
          // gpt-5 또는 o1 모델은 max_completion_tokens 사용, 그 외는 max_tokens 사용
          ...(isGpt5 ? { max_completion_tokens: 1200 } : { max_tokens: 1200 }),
          response_format: { type: 'json_object' },
        });
        
        usedModel = model;
        console.log(`[OpenAI] ✅ ${model} 모델로 성공`);
        break; // 성공 시 루프 종료
      } catch (error) {
        lastError = error;
        console.log(`[OpenAI] ❌ ${model} 모델 실패:`, error.message);
        
        // 마지막 모델인 경우 에러를 그대로 throw
        if (model === models[models.length - 1]) {
          throw error;
        }
        
        // 다음 모델로 시도 계속
        console.log(`[OpenAI] 다음 모델(${models[models.indexOf(model) + 1]})로 재시도...`);
      }
    }
    
    if (!completion) {
      throw lastError || new Error('모든 모델 호출 실패');
    }
    
    // 사용된 모델 로깅
    if (usedModel) {
      console.log(`[OpenAI] 최종 사용 모델: ${usedModel}`);
    }

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
    
    // OpenAI API 에러 타입별 처리
    let statusCode = 500;
    let errorMessage = 'Failed to generate story';
    let userMessage = '이야기 생성에 실패했습니다. 잠시 후 다시 시도해주세요.';
    
    if (error.response) {
      // OpenAI API 응답 에러
      const status = error.response.status;
      const errorData = error.response.data || error.response.error || {};
      
      if (status === 429) {
        statusCode = 429;
        errorMessage = 'OpenAI API quota exceeded';
        userMessage = 'OpenAI API 할당량이 초과되었습니다. 관리자에게 문의해주세요.';
      } else if (status === 401) {
        statusCode = 401;
        errorMessage = 'OpenAI API authentication failed';
        userMessage = 'OpenAI API 인증에 실패했습니다. 관리자에게 문의해주세요.';
      } else if (status === 400) {
        statusCode = 400;
        errorMessage = 'OpenAI API bad request';
        userMessage = '요청 형식이 올바르지 않습니다.';
      } else {
        statusCode = status;
        errorMessage = `OpenAI API error: ${errorData.message || error.message}`;
        userMessage = 'OpenAI API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.';
      }
    } else if (error.message) {
      // 일반 에러
      if (error.message.includes('429') || error.message.includes('quota')) {
        statusCode = 429;
        errorMessage = 'OpenAI API quota exceeded';
        userMessage = 'OpenAI API 할당량이 초과되었습니다. 관리자에게 문의해주세요.';
      } else {
        errorMessage = error.message;
      }
    }
    
    // 에러 응답에도 CORS 헤더 포함 (이미 함수 시작 부분에서 설정됨)
    res.status(statusCode).json({
      error: errorMessage,
      message: userMessage,
      details: error.message,
    });
    return;
  }
}
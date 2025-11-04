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
  // ✅ 모든 요청에 대한 로깅 (모바일 요청 도달 확인용)
  console.log(`[Handler] 요청 도달: method=${req.method}, url=${req.url}, origin=${req.headers.origin || 'none'}, referer=${req.headers.referer || 'none'}`);
  
  // Vercel preview URL 패턴 매칭 함수
  const isVercelPreviewUrl = (url) => {
    if (!url) return false;
    return url.includes('multiverse-if') && url.includes('.vercel.app');
  };

  // 요청 출처 확인 (origin 헤더 우선 확인)
  // 웹뷰 환경에서는 origin이 null일 수 있으므로 referer도 확인
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  const userAgent = req.headers['user-agent'] || '';
  
  // ✅ 모든 요청 헤더 로깅 (모바일 디버깅용)
  console.log(`[CORS] 요청 헤더:`, {
    origin: origin || 'none',
    referer: referer || 'none',
    userAgent: userAgent.substring(0, 100) || 'none',
    method: req.method,
  });
  
  // 웹뷰 환경 감지 (User-Agent와 Origin 조합)
  const isWebViewRequest = 
    !origin || 
    origin === 'null' || 
    origin === 'file://' ||
    referer.includes('file://') ||
    /wv/i.test(userAgent) ||
    (userAgent && !/Safari|Chrome|CriOS|FxiOS|Edg/i.test(userAgent) && /iPhone|iPad|iPod|Android/i.test(userAgent));
  
  // CORS 허용 origin 결정
  let allowedOrigin = '*'; // 기본값을 *로 설정 (더 안전한 fallback)
  
  // 웹뷰 요청인 경우 먼저 처리
  if (isWebViewRequest) {
    allowedOrigin = '*';
    console.log(`[CORS] 📱 웹뷰 환경 감지: origin=${origin}, referer=${referer}, userAgent=${userAgent.substring(0, 50)}...`);
    console.log(`[CORS] ✅ 웹뷰 환경 - * 허용`);
  } else if (origin && origin !== 'null' && origin !== 'file://') {
    // 1. Vercel preview URL인 경우 허용 (가장 먼저 체크)
    // 예: https://multiverse-if-dpf1.vercel.app (프론트엔드 preview URL)
    if (isVercelPreviewUrl(origin)) {
      allowedOrigin = origin;
      console.log(`[CORS] ✅ Vercel preview URL 허용: ${origin}`);
    }
    // 2. 로컬 개발 환경 (포트 번호 포함하여 체크) - 모두 허용
    else if (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      origin.includes('172.30.1.14') ||
      /^https?:\/\/(localhost|127\.0\.0\.1|172\.30\.1\.14)(:\d+)?/.test(origin)
    ) {
      allowedOrigin = origin;
      console.log(`[CORS] ✅ 로컬 개발 환경 허용: ${origin}`);
    }
    // 3. 허용된 출처 목록 (정확히 일치)
    // https://multiverse-if.vercel.app = 프로덕션 프론트엔드 URL
    else if ([
      'https://multiverse-if.vercel.app',
      'https://multiverse-if.apps.tossmini.com',
      'https://multiverse-if.private-apps.tossmini.com',
    ].includes(origin)) {
      allowedOrigin = origin;
      console.log(`[CORS] ✅ 허용된 출처 일치: ${origin}`);
    }
    // 4. 모든 출처 허용 (개발 환경 및 웹뷰 환경 지원)
    else {
      console.log(`[CORS] ✅ 모든 출처 허용 (개발 환경 지원): ${origin}`);
      allowedOrigin = origin;
    }
  } else if (origin === 'null' || origin === 'file://') {
    // null origin (앱 웹뷰)
    allowedOrigin = '*';
    console.log(`[CORS] ✅ 앱 웹뷰 환경 허용: ${origin || 'null'} -> *`);
  } else {
    // Origin이 없으면 앱 웹뷰 환경일 가능성이 높음
    allowedOrigin = '*';
    console.log('[CORS] ⚠️ Origin 헤더가 없습니다. * 허용');
  }

  // CORS 헤더 설정
  const useCredentials = allowedOrigin !== '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24시간
    'Cache-Control': 'no-store', // ✅ iOS Preflight 캐싱 방지 (중요!)
    'Vary': 'Origin', // ✅ Origin별 캐시 구분
    ...(useCredentials ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
  };

  // 디버깅: 요청 정보 로깅
  console.log('[CORS] 요청 정보:', {
    method: req.method,
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    resolvedOrigin: origin,
    allowedOrigin: allowedOrigin,
    corsHeaders: corsHeaders,
  });

  // OPTIONS 요청 (Preflight) 처리 - 가장 먼저 처리
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] ✅ OPTIONS 요청 처리: origin=${origin || 'none'}, referer=${referer || 'none'}, allowedOrigin=${allowedOrigin}`);
    console.log(`[CORS] OPTIONS CORS 헤더:`, corsHeaders);
    
    // Vercel Serverless Functions에서 헤더 전송을 보장하기 위해 writeHead만 사용
    // setHeader와 writeHead를 함께 사용하지 않음 (충돌 방지)
    // ✅ iOS Preflight 캐싱 방지를 위해 Cache-Control: no-store 포함
    try {
      res.writeHead(200, corsHeaders);
      res.end();
      console.log(`[CORS] ✅ OPTIONS 응답 전송 완료 (Cache-Control: no-store 포함)`);
    } catch (error) {
      console.error(`[CORS] ❌ OPTIONS 응답 전송 실패:`, error);
      // 에러가 발생해도 응답 시도
      try {
        res.status(200).json({ message: 'OK' });
      } catch (e) {
        console.error(`[CORS] ❌ OPTIONS 응답 대체 방법 실패:`, e);
      }
    }
    return;
  }

  // 모든 응답에 CORS 헤더 추가 (POST 요청 포함)
  // 안드로이드 브라우저를 위한 명시적 헤더 설정
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  // 디버깅: 요청 메서드 로깅
  console.log(`[Request] Method: ${req.method}, Origin: ${origin}, User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);

  if (req.method !== 'POST') {
    console.log(`[Request] ❌ Method not allowed: ${req.method}`);
    // CORS 헤더를 포함한 에러 응답
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // req.body 파싱 (Vercel에서는 자동 파싱되지만 명시적으로 확인)
  if (!req.body) {
    console.log(`[Request] ❌ Request body is missing`);
    // CORS 헤더를 포함한 에러 응답
    res.writeHead(400, corsHeaders);
    res.end(JSON.stringify({ error: 'Request body is missing' }));
    return;
  }

  try {
    const { basicInfo, scenario } = req.body || {};

    // 입력 검증
    if (!basicInfo || !scenario) {
      console.log(`[Request] ❌ Missing required fields: basicInfo=${!!basicInfo}, scenario=${!!scenario}`);
      // CORS 헤더를 포함한 에러 응답
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Missing required fields' }));
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
    // ChatGPT API 호출 (Fallback 전략: gpt-4o 우선 사용)
    // ========================================
    // gpt-5는 reasoning 모델로 토큰 한도 초과 문제가 있으므로 gpt-4o 우선 사용
    // 시도 순서: gpt-4o 기본 사용, 필요시 gpt-5 시도
    const models = ['gpt-4o', 'gpt-5'];
    
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
          temperature: 1,
          // gpt-5 또는 o1 모델은 max_completion_tokens 사용, 그 외는 max_tokens 사용
          // gpt-5 reasoning 모델은 토큰 한도가 부족할 수 있으므로 더 크게 설정
          ...(isGpt5 ? { max_completion_tokens: 2000 } : { max_tokens: 1200 }),
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

    // OpenAI 응답 파싱 (안전하게 처리)
    // gpt-5 reasoning 모델의 경우 응답 구조가 다를 수 있음
    const choice = completion.choices[0];
    const message = choice?.message || {};
    
    // 상세 로깅 (디버깅용)
    console.log(`[OpenAI] 응답 구조 확인:`, {
      finish_reason: choice?.finish_reason,
      message_keys: Object.keys(message),
      has_content: !!message.content,
      content_length: message.content?.length || 0,
      model: usedModel,
    });
    
    // content 필드 확인 (일반 모델)
    let responseText = message.content;
    
    // gpt-5 reasoning 모델의 경우, content가 없을 수 있으므로 다른 필드 확인
    if (!responseText && usedModel?.includes('gpt-5')) {
      console.log(`[OpenAI] gpt-5 모델이지만 content가 없습니다. 전체 응답 확인:`, JSON.stringify(completion, null, 2));
      // finish_reason이 'length'인 경우 토큰 한도 초과
      if (choice?.finish_reason === 'length') {
        console.warn(`[OpenAI] ⚠️ 토큰 한도 초과 (finish_reason: length). max_completion_tokens를 증가시키거나 다른 모델 사용 권장.`);
        // content가 없으면 빈 응답으로 처리하고 에러 발생
        throw new Error('응답이 토큰 한도로 인해 잘렸습니다. max_completion_tokens를 증가시키거나 gpt-4o 모델을 사용해주세요.');
      }
    }
    
    if (!responseText) {
      console.error('[OpenAI] 응답 내용이 비어있습니다:', {
        completion: JSON.stringify(completion, null, 2),
        choice: JSON.stringify(choice, null, 2),
        message: JSON.stringify(message, null, 2),
      });
      throw new Error('OpenAI 응답이 비어있습니다. 모델 응답 구조를 확인해주세요.');
    }
    
    console.log(`[OpenAI] 응답 텍스트 길이: ${responseText.length}, 첫 200자: ${responseText.substring(0, 200)}`);
    
    // JSON 파싱 (안전하게 처리)
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[OpenAI] JSON 파싱 실패:', {
        error: parseError.message,
        responseText: responseText.substring(0, 500),
        fullResponseText: responseText,
      });
      throw new Error(`JSON 파싱 실패: ${parseError.message}. 응답 내용: ${responseText.substring(0, 200)}`);
    }

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

    // 성공 응답 (CORS 헤더는 이미 설정됨)
    console.log(`[Response] ✅ Success: multiverseName=${formattedResult.multiverseName}`);
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(formattedResult));
    return;
  } catch (error) {
    console.error('[Error] ❌ Story generation failed:', {
      error: error.message,
      stack: error.stack,
      response: error.response?.status,
      responseData: error.response?.data,
    });
    
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
    
    // 에러 응답에도 CORS 헤더 포함 (writeHead 사용으로 확실하게 전송)
    console.log(`[Response] ❌ Error: statusCode=${statusCode}, userMessage=${userMessage}`);
    res.writeHead(statusCode, {
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({
      error: errorMessage,
      message: userMessage,
      details: error.message,
    }));
    return;
  }
}

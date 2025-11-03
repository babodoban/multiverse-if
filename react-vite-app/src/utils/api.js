// API 기본 URL 설정
// 개발 환경: 로컬 Vercel 개발 서버 또는 배포된 서버리스 함수
// 프로덕션: 실제 배포된 API URL
// 실제 백엔드 URL: https://multiverse-if.vercel.app/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://multiverse-if.vercel.app/api';

// 타임아웃 설정 (30초)
const TIMEOUT = 30000;

/**
 * AI에게 멀티버스 이야기 생성 요청
 * @param {Object} basicInfo - 기본 정보
 * @param {Object} scenario - 시나리오 정보
 * @returns {Promise<Object>} 생성된 결과 정보
 */
export const generateStory = async (basicInfo, scenario) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  // 디버깅: API URL 로그
  console.log('🚀 API 호출 시작:', {
    url: `${API_BASE_URL}/generate-story`,
    basicInfo,
    scenario,
  });

  // 실제 웹뷰 환경 감지 (모바일 브라우저와 구분)
  // 중요: 모바일 브라우저(크롬, 사파리)는 웹뷰가 아님!
  const isWebView = () => {
    const userAgent = navigator.userAgent || '';
    
    // 1. 명시적인 웹뷰 표시자 확인
    if (window.ReactNativeWebView || window.webkit?.messageHandlers) {
      return true;
    }
    
    // 2. userAgent에서 웹뷰 패턴 확인
    // 웹뷰는 보통 "wv" 또는 특정 앱 이름이 포함됨
    // 하지만 모바일 브라우저(크롬, 사파리)는 일반적으로 웹뷰가 아님
    if (/wv/i.test(userAgent)) {
      return true;
    }
    
    // 3. 모바일 브라우저는 웹뷰가 아님
    // Safari, Chrome, CriOS (Chrome iOS), FxiOS (Firefox iOS) 등은 브라우저
    const isMobileBrowser = /Safari|Chrome|CriOS|FxiOS|Edg/i.test(userAgent);
    if (isMobileBrowser) {
      return false; // 모바일 브라우저는 웹뷰가 아님
    }
    
    // 4. 그 외의 경우는 일반적으로 웹뷰로 간주하지 않음 (안전하게 false)
    return false;
  };

  // 현재 환경 정보 로깅 (더 상세하게)
  const fullOrigin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
  const environmentInfo = {
    isWebView: isWebView(),
    userAgent: navigator.userAgent,
    origin: fullOrigin,
    protocol: window.location.protocol,
    host: window.location.host,
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    url: `${API_BASE_URL}/generate-story`,
    isMobileBrowser: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isOnline: navigator.onLine,
  };
  console.log('🌍 환경 정보:', environmentInfo);

  // 실제 fetch 호출 전 로깅
  console.log('📡 Fetch 요청 준비:', {
    url: `${API_BASE_URL}/generate-story`,
    method: 'POST',
    origin: fullOrigin,
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
  });

  try {
    const response = await fetch(`${API_BASE_URL}/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Origin 헤더는 브라우저가 자동으로 설정하므로 수동으로 추가하지 않음
        // 수동으로 추가하면 CORS 문제가 발생할 수 있음
      },
      body: JSON.stringify({
        basicInfo,
        scenario,
      }),
      signal: controller.signal,
      // 웹뷰에서 네트워크 요청 허용
      mode: 'cors',
      credentials: 'omit',
    });

    // 응답 헤더 안전하게 로깅 (일부 브라우저에서 entries() 미지원 가능)
    let responseHeaders = {};
    try {
      if (response.headers && typeof response.headers.entries === 'function') {
        responseHeaders = Object.fromEntries(response.headers.entries());
      }
    } catch (e) {
      // 헤더 접근 실패 시 무시
    }
    
    console.log('📥 Fetch 응답 받음:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: responseHeaders,
    });

    clearTimeout(timeoutId);

    // Response body는 한 번만 읽을 수 있으므로, text로 먼저 읽고 JSON 파싱
    const responseText = await response.text();
    
    if (!response.ok) {
      // iOS에서 JSON 파싱 실패 가능성을 고려하여 안전하게 처리
      let errorData = {};
      try {
        console.log(`[Response] ❌ Error response text: ${responseText.substring(0, 200)}`);
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Response] ❌ JSON 파싱 실패:', parseError);
        console.error('[Response] Raw response:', responseText);
        // 파싱 실패 시 빈 객체 사용
      }
      
      const error = new Error(errorData.message || errorData.error || `API request failed: ${response.statusText}`);
      error.status = response.status;
      error.userMessage = errorData.message; // 사용자 친화적 메시지
      error.details = errorData.details; // 상세 에러 정보
      console.error('❌ API 응답 에러:', {
        status: response.status,
        statusText: response.statusText,
        statusCode: response.status,
        errorData,
        environmentInfo,
        platform: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' : /Android/i.test(navigator.userAgent) ? 'Android' : 'Other',
      });
      throw error;
    }

    // 성공 응답 JSON 파싱 (안전하게 처리)
    let data;
    try {
      console.log(`[Response] ✅ Success response text length: ${responseText.length}`);
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Response] ❌ JSON 파싱 실패:', parseError);
      console.error('[Response] Raw response:', responseText);
      throw new Error('응답을 파싱할 수 없습니다.');
    }
    console.log('✅ API 응답 성공:', data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // 상세한 에러 정보 로깅
    const errorDetails = {
      error: error.message,
      name: error.name,
      url: `${API_BASE_URL}/generate-story`,
      apiBaseUrl: API_BASE_URL,
      environmentInfo,
      stack: error.stack,
    };
    
    // 네트워크 에러인 경우 추가 정보 수집
    if (error instanceof TypeError || error.name === 'NetworkError' || error.message.includes('fetch') || error.name === 'AbortError') {
      errorDetails.networkError = true;
      errorDetails.navigatorOnline = navigator.onLine;
      errorDetails.navigatorConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      errorDetails.errorType = error.constructor.name;
      errorDetails.errorMessage = error.message;
      errorDetails.fullError = String(error);
      
      // CORS 에러 가능성 확인
      if (error.message.includes('CORS') || error.message.includes('Access-Control') || error.message.includes('origin')) {
        errorDetails.isCorsError = true;
        console.error('❌ CORS 에러 가능성:', {
          ...errorDetails,
          actualOrigin: fullOrigin,
          apiUrl: `${API_BASE_URL}/generate-story`,
          suggestion: '백엔드 CORS 설정에서 이 origin을 허용해야 합니다.',
        });
      } else {
        console.error('❌ 네트워크 에러 상세:', errorDetails);
      }
    } else {
      console.error('❌ API 호출 실패:', errorDetails);
    }
    
    // 타임아웃 에러 처리
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      timeoutError.userMessage = '응답 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
      throw timeoutError;
    }
    
    // 네트워크 에러 처리
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      networkError.userMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
      throw networkError;
    }
    
    throw error;
  }
};


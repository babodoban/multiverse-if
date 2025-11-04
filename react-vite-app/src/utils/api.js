// API 기본 URL 설정
// 모바일 웹뷰에서는 localhost를 사용할 수 없으므로 항상 운영 URL 사용
// 운영 백엔드 URL: https://multiverse-if.vercel.app/api
const getApiBaseUrl = () => {
  // 환경 변수에서 URL 가져오기
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // 웹뷰 환경 감지 (간단한 체크)
  const isWebView = !window.location.origin || 
                    window.location.origin === 'null' || 
                    window.location.origin === 'file://' ||
                    window.location.href.startsWith('file://') ||
                    window.ReactNativeWebView ||
                    window.webkit?.messageHandlers;
  
  // 웹뷰 환경이거나 모바일 환경에서는 항상 운영 URL 사용
  if (isWebView || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    console.log('📱 모바일/웹뷰 환경 감지 - 운영 API URL 사용');
    return 'https://multiverse-if.vercel.app/api';
  }
  
  // 데스크탑 환경에서만 환경 변수 또는 localhost 사용
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  
  // 기본값: 운영 URL (모바일 호환성)
  return 'https://multiverse-if.vercel.app/api';
};

const API_BASE_URL = getApiBaseUrl();

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
    const origin = window.location.origin;
    const href = window.location.href;
    
    // 1. 명시적인 웹뷰 표시자 확인 (가장 확실한 방법)
    if (window.ReactNativeWebView || window.webkit?.messageHandlers) {
      return true;
    }
    
    // 2. Origin이 null이거나 file://인 경우 웹뷰 가능성 높음
    if (!origin || origin === 'null' || origin === 'file://' || href.startsWith('file://')) {
      return true; // file:// 또는 null origin은 웹뷰일 가능성이 높음
    }
    
    // 3. userAgent에서 웹뷰 패턴 확인
    // 웹뷰는 보통 "wv" 또는 특정 앱 이름이 포함됨
    if (/wv/i.test(userAgent)) {
      return true;
    }
    
    // 4. Android WebView 감지 (Chrome이 아닌 WebView)
    // Android WebView는 "Version/X.X" 형식의 User-Agent를 가질 수 있음
    if (/Android/i.test(userAgent) && !/Chrome/i.test(userAgent) && /Version\//i.test(userAgent)) {
      return true;
    }
    
    // 5. iOS에서 Safari가 아닌 경우 웹뷰 가능성
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      // Safari는 명시적으로 표시됨
      const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|OPiOS/i.test(userAgent);
      // Safari가 아니고 명시적 웹뷰 표시자도 없다면 웹뷰일 가능성 검토
      if (!isSafari) {
        // standalone 모드 체크 (iOS에서 PWA도 standalone이지만, 웹뷰도 가능)
        // 추가로, iOS에서 Safari가 아닌데도 모바일 환경이라면 웹뷰일 가능성 높음
        return true;
      }
    }
    
    // 6. 모바일 브라우저는 웹뷰가 아님
    // Safari, Chrome, CriOS (Chrome iOS), FxiOS (Firefox iOS) 등은 브라우저
    const isMobileBrowser = /Safari|Chrome|CriOS|FxiOS|Edg/i.test(userAgent);
    if (isMobileBrowser) {
      return false; // 모바일 브라우저는 웹뷰가 아님
    }
    
    // 7. 모바일 환경이지만 브라우저 표시자가 없는 경우 웹뷰일 가능성
    if (/iPhone|iPad|iPod|Android/i.test(userAgent)) {
      // 모바일 환경인데 브라우저 표시자가 없다면 웹뷰일 가능성
      return true;
    }
    
    // 8. 그 외의 경우는 일반적으로 웹뷰로 간주하지 않음 (안전하게 false)
    return false;
  };

  // 현재 환경 정보 로깅 (더 상세하게)
  const fullOrigin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
  const detectedWebView = isWebView();
  const environmentInfo = {
    isWebView: detectedWebView,
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
    hasReactNativeWebView: !!window.ReactNativeWebView,
    hasWebkitMessageHandlers: !!window.webkit?.messageHandlers,
    navigatorStandalone: window.navigator.standalone,
  };
  console.log('🌍 환경 정보:', environmentInfo);
  
  // 웹뷰 환경 특별 처리 로그
  if (detectedWebView) {
    console.log('📱 웹뷰 환경 감지됨 - 특별 처리 적용');
  }

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

  // 웹뷰 환경에서 fetch 옵션 조정
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 웹뷰 환경에서는 Referer를 추가로 보내볼 수 있음 (일부 웹뷰에서 유용)
      ...(detectedWebView && window.location.href ? { 'Referer': window.location.href } : {}),
    },
    body: JSON.stringify({
      basicInfo,
      scenario,
    }),
    signal: controller.signal,
  };

  // 웹뷰 환경에서는 mode와 credentials 설정 다르게 시도
  if (detectedWebView) {
    // 웹뷰 환경: cors 모드 유지하되, credentials는 omit
    fetchOptions.mode = 'cors';
    fetchOptions.credentials = 'omit';
    console.log('📱 웹뷰 환경 - fetch 옵션:', {
      mode: fetchOptions.mode,
      credentials: fetchOptions.credentials,
      hasReferer: !!fetchOptions.headers.Referer,
    });
  } else {
    // 일반 브라우저: 기본 설정
    fetchOptions.mode = 'cors';
    fetchOptions.credentials = 'omit';
  }

  // ✅ 웹뷰 환경에서는 XMLHttpRequest 사용 (fetch가 차단될 수 있음)
  if (detectedWebView) {
    console.log('📱 웹뷰 환경 - XMLHttpRequest 사용:', {
      url: `${API_BASE_URL}/generate-story`,
      method: 'POST',
      apiBaseUrl: API_BASE_URL,
    });
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${API_BASE_URL}/generate-story`;
      
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      // 웹뷰 환경에서 필요한 경우 Referer 추가
      if (window.location.href) {
        try {
          xhr.setRequestHeader('Referer', window.location.href);
        } catch (e) {
          // Referer 설정 실패 시 무시
        }
      }
      
      xhr.onload = () => {
        console.log('📱 웹뷰 환경 - XMLHttpRequest 응답:', {
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
        });
        
        clearTimeout(timeoutId);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('✅ API 응답 성공 (XMLHttpRequest):', data);
            resolve(data);
          } catch (parseError) {
            console.error('[XMLHttpRequest] JSON 파싱 실패:', parseError);
            console.error('[XMLHttpRequest] Raw response:', xhr.responseText);
            reject(new Error('응답을 파싱할 수 없습니다.'));
          }
        } else {
          let errorData = {};
          try {
            errorData = JSON.parse(xhr.responseText);
          } catch (e) {
            // 파싱 실패 시 빈 객체
          }
          
          const error = new Error(errorData.message || errorData.error || `API request failed: ${xhr.statusText}`);
          error.status = xhr.status;
          error.userMessage = errorData.message;
          error.details = errorData.details;
          console.error('❌ API 응답 에러 (XMLHttpRequest):', {
            status: xhr.status,
            statusText: xhr.statusText,
            errorData,
          });
          reject(error);
        }
      };
      
      xhr.onerror = () => {
        clearTimeout(timeoutId);
        console.error('❌ XMLHttpRequest 네트워크 에러:', {
          readyState: xhr.readyState,
          status: xhr.status,
        });
        const error = new Error('Network error');
        error.name = 'NetworkError';
        error.userMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
        reject(error);
      };
      
      xhr.ontimeout = () => {
        clearTimeout(timeoutId);
        console.error('❌ XMLHttpRequest 타임아웃');
        const error = new Error('Request timeout');
        error.name = 'TimeoutError';
        error.userMessage = '응답 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
        reject(error);
      };
      
      xhr.timeout = TIMEOUT;
      xhr.send(fetchOptions.body);
    });
  }

  try {
    // ✅ 일반 브라우저 환경에서는 fetch 사용
    // ✅ 웹뷰 환경에서 요청 전 로깅
    if (detectedWebView) {
      console.log('📱 웹뷰 환경 - API 요청 시작:', {
        url: `${API_BASE_URL}/generate-story`,
        method: 'POST',
        hasBody: !!fetchOptions.body,
        apiBaseUrl: API_BASE_URL,
        fullUrl: `${API_BASE_URL}/generate-story`,
      });
    }
    
    // ✅ fetch 호출 전 최종 확인 로그
    console.log('🚀 Fetch 호출 직전:', {
      url: `${API_BASE_URL}/generate-story`,
      options: {
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        mode: fetchOptions.mode,
        credentials: fetchOptions.credentials,
        hasBody: !!fetchOptions.body,
        bodyLength: fetchOptions.body?.length || 0,
      },
      isWebView: detectedWebView,
      navigatorOnline: navigator.onLine,
    });
    
    const response = await fetch(`${API_BASE_URL}/generate-story`, fetchOptions);
    
    // ✅ 웹뷰 환경에서 응답 받음 로깅
    if (detectedWebView) {
      let webViewHeaders = {};
      try {
        if (response.headers && typeof response.headers.entries === 'function') {
          webViewHeaders = Object.fromEntries(response.headers.entries());
        }
      } catch (e) {
        // 헤더 접근 실패 시 무시
      }
      console.log('📱 웹뷰 환경 - API 응답 받음:', {
        status: response.status,
        ok: response.ok,
        headers: webViewHeaders,
      });
    }

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
      isWebView: detectedWebView,
      navigatorOnline: navigator.onLine,
    };
    
    // ✅ 웹뷰 환경에서 에러 발생 시 특별 로깅
    if (detectedWebView) {
      console.error('📱 웹뷰 환경 - API 요청 실패:', {
        error: error.message,
        name: error.name,
        url: `${API_BASE_URL}/generate-story`,
        navigatorOnline: navigator.onLine,
        fullError: String(error),
        stack: error.stack,
      });
    }
    
    // 네트워크 에러인 경우 추가 정보 수집
    if (error instanceof TypeError || error.name === 'NetworkError' || error.message.includes('fetch') || error.name === 'AbortError') {
      errorDetails.networkError = true;
      errorDetails.navigatorConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      errorDetails.errorType = error.constructor.name;
      errorDetails.errorMessage = error.message;
      errorDetails.fullError = String(error);
      
      // ✅ fetch가 전혀 호출되지 않았을 가능성 확인
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error('❌ Fetch 호출 실패 - 요청이 서버에 도달하지 못했습니다:', {
          ...errorDetails,
          possibleCauses: [
            'CORS preflight 실패',
            '네트워크 연결 차단',
            '웹뷰에서 fetch API 미지원',
            '서버 URL 접근 불가',
          ],
          troubleshooting: [
            '프론트엔드 콘솔에서 "🚀 Fetch 호출 직전" 로그 확인',
            '서버 로그에서 "[Handler] 요청 도달" 로그 확인',
            '네트워크 탭에서 OPTIONS/POST 요청 확인',
          ],
        });
      }
      
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


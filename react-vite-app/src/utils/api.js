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

  // 앱 환경 감지 (웹뷰 확인)
  const isWebView = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  };

  // 현재 환경 정보 로깅
  const environmentInfo = {
    isWebView: isWebView(),
    userAgent: navigator.userAgent,
    origin: window.location.origin,
    protocol: window.location.protocol,
    host: window.location.host,
    url: `${API_BASE_URL}/generate-story`,
  };
  console.log('🌍 환경 정보:', environmentInfo);

  try {
    const response = await fetch(`${API_BASE_URL}/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 앱 환경에서 필요한 경우 Origin 헤더 추가
        ...(environmentInfo.isWebView && window.location.origin ? { 'Origin': window.location.origin } : {}),
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

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.error || `API request failed: ${response.statusText}`);
      error.status = response.status;
      error.userMessage = errorData.message; // 사용자 친화적 메시지
      error.details = errorData.details; // 상세 에러 정보
      console.error('❌ API 응답 에러:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        environmentInfo,
      });
      throw error;
    }

    const data = await response.json();
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
    if (error instanceof TypeError || error.name === 'NetworkError' || error.message.includes('fetch')) {
      errorDetails.networkError = true;
      errorDetails.navigatorOnline = navigator.onLine;
      errorDetails.navigatorConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      console.error('❌ 네트워크 에러 상세:', errorDetails);
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


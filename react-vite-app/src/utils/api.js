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

  try {
    const response = await fetch(`${API_BASE_URL}/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        basicInfo,
        scenario,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.error || `API request failed: ${response.statusText}`);
      error.status = response.status;
      error.userMessage = errorData.message; // 사용자 친화적 메시지
      error.details = errorData.details; // 상세 에러 정보
      throw error;
    }

    const data = await response.json();
    console.log('✅ API 응답 성공:', data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ API 호출 실패:', {
      error: error.message,
      name: error.name,
      url: `${API_BASE_URL}/generate-story`,
      apiBaseUrl: API_BASE_URL,
    });
    
    // 타임아웃 에러 처리
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    
    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    throw error;
  }
};


// API 기본 URL 설정
const API_BASE_URL = 'https://multiverse-if.vercel.app/api';

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

  try {
    console.log('🚀 API 호출 시작:', {
      url: `${API_BASE_URL}/generate-story`,
      basicInfo,
      scenario,
    });

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

    // 응답 본문 읽기
    const responseText = await response.text();
    
    if (!response.ok) {
      // 에러 응답 파싱 시도
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        // 파싱 실패 시 빈 객체
      }
      
      const error = new Error(errorData.message || errorData.error || `API request failed: ${response.statusText}`);
      error.status = response.status;
      error.userMessage = errorData.message;
      throw error;
    }

    // 성공 응답 파싱
    const data = JSON.parse(responseText);
    console.log('✅ API 응답 성공:', data);
    return data;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('❌ API 호출 실패:', error);
    
    // 타임아웃 에러 처리
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      timeoutError.userMessage = '응답 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
      throw timeoutError;
    }
    
    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      networkError.userMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
      throw networkError;
    }
    
    // 기존 에러 그대로 전달 (이미 userMessage가 포함되어 있을 수 있음)
    throw error;
  }
};

// react-vite-app/api.js

// API 기본 URL 설정
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ 환경 자동 인식: 로컬/배포 모두 대응
if (!API_BASE_URL) {
  const host = window.location.host;
  if (host.includes('localhost') || host.includes('192.168.')) {
    API_BASE_URL = `http://${host}/api`;
  } else {
    API_BASE_URL = 'https://multiverse-if.vercel.app/api';
  }
}

// ✅ 공통 fetch 함수
export async function callAPI(endpoint, data = {}, method = 'POST') {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🚀 API 호출 시작:', { url, data });

  const fetchOptions = {
    method,
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'omit', // ✅ CORS-safe (백엔드에서 credentials 허용)
  };

  if (method !== 'GET') {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // ❗ 응답 확인
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error('API 호출 실패');
    }

    const result = await response.json();
    console.log('✅ API 응답 성공:', result);
    return result;
  } catch (error) {
    console.error('🚨 API 호출 중 예외 발생:', error);
    throw error;
  }
}

// ✅ 이야기 생성 전용 함수
export async function generateStory(basicInfo, scenario) {
  try {
    return await callAPI('/generate-story', { basicInfo, scenario }, 'POST');
  } catch (error) {
    console.error('🚨 이야기 생성 실패:', error);
    throw new Error('이야기 생성에 실패했습니다.');
  }
}

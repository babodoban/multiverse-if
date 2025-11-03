import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { generateStory as apiGenerateStory } from '../utils/api';

// 에러 메시지 정의
const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  API_ERROR: '이야기 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT_ERROR: '응답 시간이 초과되었습니다. 다시 시도해주세요.',
  QUOTA_ERROR: 'OpenAI API 할당량이 초과되었습니다. 관리자에게 문의해주세요.',
  AUTH_ERROR: 'OpenAI API 인증에 실패했습니다. 관리자에게 문의해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // 로컬 스토리지에서 기본 정보 불러오기
  const savedBasicInfo = storage.loadBasicInfo();
  
  const [basicInfo, setBasicInfo] = useState(savedBasicInfo || {
    job: '',
    gender: '',
    interests: '',
    relationship: '',
    children: '',
    summary: '',
  });

  const [scenario, setScenario] = useState({
    importantMoment: '',
    alternativeChoice: '',
    thoughtAtThatTime: '',
  });

  const [generatedStory, setGeneratedStory] = useState('');
  const [resultInfo, setResultInfo] = useState({
    job: '',
    location: '',
    relationship: '',
    story: '',
    multiverseName: '',
    summary: '',
    keywords: '',
    message: '',
  });

  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    startTime: null,
    elapsedTime: null,
    error: null,
  });

  // 기본 정보가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (basicInfo.job || basicInfo.gender || basicInfo.interests || basicInfo.relationship || basicInfo.children) {
      storage.saveBasicInfo(basicInfo);
    }
  }, [basicInfo]);

  const updateBasicInfo = (info) => {
    setBasicInfo((prev) => ({ ...prev, ...info }));
  };

  const updateScenario = (data) => {
    setScenario((prev) => ({ ...prev, ...data }));
  };

  // 시나리오 초기화 (다시 입력하기 버튼 클릭 시)
  const resetScenario = () => {
    setScenario({
      importantMoment: '',
      alternativeChoice: '',
      thoughtAtThatTime: '',
    });
    setGeneratedStory('');
    setResultInfo({
      job: '',
      location: '',
      relationship: '',
      story: '',
      multiverseName: '',
      summary: '',
      keywords: '',
      message: '',
    });
  };

  const generateStory = useCallback(async () => {
    // 캐시 확인 (개발 중에는 캐시 사용 안 함 - 주석 처리)
    // const cached = storage.loadCache(basicInfo, scenario);
    // if (cached) {
    //   console.log('📦 캐시에서 데이터 로드');
    //   setGeneratedStory(cached.story);
    //   setResultInfo({
    //     job: cached.job || basicInfo.job || '',
    //     location: cached.location || '',
    //     relationship: cached.relationship || basicInfo.relationship || '',
    //     story: cached.story || '',
    //     multiverseName: cached.multiverseName || '',
    //     summary: cached.summary || '',
    //     keywords: cached.keywords || '',
    //     message: cached.message || '',
    //   });
    //   return cached.story;
    // }

    // 로딩 시작
    const startTime = Date.now();
    setLoadingState({
      isLoading: true,
      startTime,
      elapsedTime: 0,
      error: null,
    });

    // 경과 시간 업데이트 (1초마다)
    const timer = setInterval(() => {
      setLoadingState((prev) => ({
        ...prev,
        elapsedTime: prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : 0,
      }));
    }, 1000);

    try {
      // AI API 호출
      const result = await apiGenerateStory(basicInfo, scenario);
      
      // 타이머 정리
      clearInterval(timer);
      
      // 결과 저장
      setGeneratedStory(result.story);
      setResultInfo({
        job: result.job || basicInfo.job || '',
        location: result.location || '',
        relationship: result.relationship || basicInfo.relationship || '',
        story: result.story || '',
        multiverseName: result.multiverseName || '',
        summary: result.summary || '',
        keywords: result.keywords || '',
        message: result.message || '',
      });

      // 캐시에 저장
      storage.saveCache(basicInfo, scenario, {
        job: result.job || basicInfo.job || '',
        location: result.location || '',
        relationship: result.relationship || basicInfo.relationship || '',
        story: result.story || '',
        multiverseName: result.multiverseName || '',
        summary: result.summary || '',
        keywords: result.keywords || '',
        message: result.message || '',
      });

      // 로딩 종료
      setLoadingState({
        isLoading: false,
        startTime: null,
        elapsedTime: Math.floor((Date.now() - startTime) / 1000),
        error: null,
      });
      
      return result.story;
    } catch (error) {
      // 타이머 정리
      clearInterval(timer);
      
      console.error('Failed to generate story:', error);
      
      // 에러 타입에 따른 메시지 설정
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      
      // 백엔드에서 전달된 사용자 친화적 메시지 우선 사용
      if (error.userMessage) {
        errorMessage = error.userMessage;
      }
      // 상태 코드 기반 에러 처리
      else if (error.status === 429 || error.message.includes('429') || error.message.includes('quota')) {
        errorMessage = ERROR_MESSAGES.QUOTA_ERROR;
      } else if (error.status === 401 || error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = ERROR_MESSAGES.AUTH_ERROR;
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      } else if (error.message.includes('timeout')) {
        errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
      } else {
        errorMessage = ERROR_MESSAGES.API_ERROR;
      }

      // 로딩 종료 (에러 포함)
      setLoadingState({
        isLoading: false,
        startTime: null,
        elapsedTime: Math.floor((Date.now() - startTime) / 1000),
        error: errorMessage,
      });

      // 에러 발생 시 더미 데이터 반환하지 않고 에러만 표시
      // (로딩 화면에서 에러 메시지가 표시되도록)
      // 사용자가 직접 재시도할 수 있도록 함
      throw error;
    }
  }, [basicInfo, scenario]);

  const value = {
    basicInfo,
    scenario,
    generatedStory,
    resultInfo,
    loadingState,
    updateBasicInfo,
    updateScenario,
    generateStory,
    resetScenario,
    clearError: () => {
      setLoadingState((prev) => ({ ...prev, error: null }));
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { generateStory as apiGenerateStory } from '../utils/api';

// 에러 메시지 정의
const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  API_ERROR: '이야기 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT_ERROR: '응답 시간이 초과되었습니다. 다시 시도해주세요.',
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
    // 캐시 확인
    const cached = storage.loadCache(basicInfo, scenario);
    if (cached) {
      setGeneratedStory(cached.story);
      setResultInfo({
        job: cached.job || basicInfo.job || '',
        location: cached.location || '',
        relationship: cached.relationship || basicInfo.relationship || '',
        story: cached.story || '',
        multiverseName: cached.multiverseName || '',
        summary: cached.summary || '',
        keywords: cached.keywords || '',
        message: cached.message || '',
      });
      return cached.story;
    }

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
      if (error.message.includes('fetch') || error.message.includes('network')) {
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

      // 에러 발생 시 모의 데이터 반환 (폴백)
      const mockLocation = '프랑스, 파리';
      const mockRelationship = basicInfo.relationship || '연애중';
      const mockStory = `당신은 파리의 작은 아틀리에에서 매일 아침 커피 한 잔과 함께 하루를 시작합니다. 세느강을 바라보며 그림을 그리는 것이 일상이 되었고, 작은 갤러리에서 첫 개인전을 성공적으로 마쳤습니다. 예술가들과의 모임에서 영감을 받으며, 때로는 거리에서 즉흥적으로 스케치를 하는 자유로운 삶을 살고 있습니다. 물질적으로는 풍요롭지 않지만, 매일 매일이 새로운 창작의 기회가 되는 충만한 인생을 보내고 있습니다.`;
      
      setGeneratedStory(mockStory);
      setResultInfo({
        job: basicInfo.job || '여행블로거',
        location: mockLocation,
        relationship: `${basicInfo.relationship ? `같은 예술가인 파트너와 함께 창작 활동을 하며 2년째 ${mockRelationship}` : mockRelationship}`,
        story: mockStory,
        multiverseName: '파리 아티스트 버전',
        summary: '자유로운 예술가의 삶',
        keywords: '창작, 자유, 예술',
        message: '선택의 순간이 당신을 여기로 이끌었습니다.',
      });
      
      return mockStory;
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


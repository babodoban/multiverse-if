const STORAGE_KEYS = {
  BASIC_INFO: 'multiverse_basic_info',
  CACHE: 'multiverse_cache',
};

// 캐시 키 생성 (입력값 기반)
const generateCacheKey = (basicInfo, scenario) => {
  const data = {
    job: basicInfo.job,
    gender: basicInfo.gender,
    interests: basicInfo.interests,
    relationship: basicInfo.relationship,
    children: basicInfo.children,
    importantMoment: scenario.importantMoment,
    alternativeChoice: scenario.alternativeChoice,
  };
  return JSON.stringify(data);
};

export const storage = {
  // 기본 정보 저장
  saveBasicInfo: (basicInfo) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BASIC_INFO, JSON.stringify(basicInfo));
    } catch (error) {
      console.error('Failed to save basic info:', error);
    }
  },

  // 기본 정보 불러오기
  loadBasicInfo: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BASIC_INFO);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load basic info:', error);
      return null;
    }
  },

  // 기본 정보 삭제
  clearBasicInfo: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.BASIC_INFO);
    } catch (error) {
      console.error('Failed to clear basic info:', error);
    }
  },

  // 결과 캐시 저장
  saveCache: (basicInfo, scenario, result) => {
    try {
      const cache = this.loadAllCache();
      const key = generateCacheKey(basicInfo, scenario);
      cache[key] = {
        result,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  },

  // 결과 캐시 불러오기
  loadCache: (basicInfo, scenario) => {
    try {
      const cache = this.loadAllCache();
      const key = generateCacheKey(basicInfo, scenario);
      const cached = cache[key];
      
      if (!cached) return null;
      
      // 캐시 만료 시간: 24시간
      const CACHE_EXPIRY = 24 * 60 * 60 * 1000;
      if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
        // 만료된 캐시 삭제
        delete cache[key];
        localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cache));
        return null;
      }
      
      return cached.result;
    } catch (error) {
      console.error('Failed to load cache:', error);
      return null;
    }
  },

  // 전체 캐시 불러오기
  loadAllCache: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load cache:', error);
      return {};
    }
  },

  // 캐시 삭제
  clearCache: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CACHE);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },
};


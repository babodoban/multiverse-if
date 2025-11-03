/**
 * 광고 상태를 전역적으로 공유하기 위한 스토어
 * ScenarioInputPage와 LoadingPage에서 공유
 */
export const adStateStore = {
  adLoaded: false,
  adCleanup: null,
  isSupportedChecked: false, // isSupported 확인 여부 (중복 확인 방지)
};


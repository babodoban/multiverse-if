import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
// GoogleAdMob은 정적 import하지 않음 (웹뷰 환경에서 에러 발생 가능)
// 대신 동적 import로 안전하게 로드
import { adStateStore } from '../utils/adStore';
import './ScenarioInputPage.css';

/** 광고 그룹 ID */
const AD_GROUP_IDS = {
  REWARDED: 'ait-ad-test-rewarded-id',      // 보상형 광고
  INTERSTITIAL: 'ait-ad-test-interstitial-id',  // 전면형 광고
};

export const ScenarioInputPage = () => {
  const navigate = useNavigate();
  const { scenario, updateScenario } = useAppContext();
  const adCleanupRef = useRef(null); // 광고 cleanup 함수 저장
  const hasLoadedRef = useRef(false); // 광고 로드 시도 여부 (중복 방지)

  const [localScenario, setLocalScenario] = useState({
    importantMoment: scenario.importantMoment || '',
    alternativeChoice: scenario.alternativeChoice || '',
    thoughtAtThatTime: scenario.thoughtAtThatTime || '',
  });

  const handleInputChange = (field, value) => {
    const updated = { ...localScenario, [field]: value };
    setLocalScenario(updated);
    updateScenario({ [field]: value });
  };

  const handleBack = () => {
    navigate('/basic-info');
  };

  // 광고 로드 함수 (동적 import 사용으로 안전하게 처리)
  const loadAd = useCallback(async () => {
    // 이미 로드 시도했으면 무시 (중복 방지)
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    // GoogleAdMob 동적 import 시도 (에러가 발생해도 전체 플로우를 막지 않음)
    let GoogleAdMob = null;
    try {
      const webFramework = await import('@apps-in-toss/web-framework');
      GoogleAdMob = webFramework?.GoogleAdMob || null;
    } catch (error) {
      console.log('[ScenarioInputPage] GoogleAdMob 동적 import 실패. 광고 없이 진행합니다.', error.message || error);
      return; // 광고 없이 계속 진행
    }

    // GoogleAdMob 객체 존재 여부 확인
    if (!GoogleAdMob || !GoogleAdMob.loadAppsInTossAdMob) {
      console.log('[ScenarioInputPage] GoogleAdMob이 사용할 수 없습니다. 광고 없이 진행합니다.');
      return;
    }

    // isSupported 함수 존재 여부 확인 (웹 환경에서는 없을 수 있음)
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported) {
      console.log('[ScenarioInputPage] GoogleAdMob isSupported 함수가 없습니다. 광고 없이 진행합니다.');
      return;
    }

    // 이미 isSupported를 확인했다면 다시 확인하지 않음 (전역 스토어 사용)
    if (!adStateStore.isSupportedChecked) {
      // 안전하게 isSupported 체크 (웹 브라우저에서는 에러 발생 가능)
      let isSupported = false;
      try {
        isSupported = GoogleAdMob.loadAppsInTossAdMob.isSupported() === true;
        adStateStore.isSupportedChecked = true; // 확인 완료 표시
      } catch (error) {
        // 웹 브라우저 환경에서 발생하는 에러 - 광고 없이 진행
        console.log('[ScenarioInputPage] 광고 로드 지원 여부 확인 실패. 광고 없이 진행합니다.', error.message || error);
        adStateStore.isSupportedChecked = true; // 확인 완료 표시 (실패했지만 확인은 했음)
        return;
      }

      if (!isSupported) {
        console.log('[ScenarioInputPage] GoogleAdMob이 지원되지 않는 환경입니다. 광고 없이 진행합니다.');
        return;
      }
    }

    // 이미 로드 중이거나 로드 완료된 경우 무시
    if (adStateStore.adLoaded) {
      return;
    }

    try {
      // 광고 로드 (전면형 광고)
      const cleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_IDS.INTERSTITIAL,
        },
        onEvent: (event) => {
          console.log('[ScenarioInputPage] 광고 이벤트:', event.type);
          switch (event.type) {
          case 'loaded':
            console.log('[ScenarioInputPage] 광고 로드 성공');
            adStateStore.adLoaded = true; // 전역 스토어에 저장
            break;
          case 'failed_to_load':
            console.log('[ScenarioInputPage] 광고 로드 실패. 광고 없이 진행합니다.');
            adStateStore.adLoaded = false; // 전역 스토어에 저장
            break;
          }
        },
        onError: (error) => {
          console.log('[ScenarioInputPage] 광고 불러오기 오류. 광고 없이 진행합니다.', error);
          adStateStore.adLoaded = false;
        },
      });

      adCleanupRef.current = cleanup;
      adStateStore.adCleanup = cleanup; // 전역 스토어에 저장
    } catch (error) {
      console.log('[ScenarioInputPage] 광고 로드 함수 호출 실패. 광고 없이 진행합니다.', error);
      adStateStore.adLoaded = false;
    }
  }, []);

  // 컴포넌트 마운트 시 광고 로드 시작 (한 번만 실행)
  // 광고 로드 에러가 발생해도 페이지는 정상 작동
  useEffect(() => {
    loadAd().catch((error) => {
      console.error('[ScenarioInputPage] 광고 로드 중 예상치 못한 에러:', error);
      // 에러가 발생해도 페이지는 정상 작동
    });

    // 컴포넌트 언마운트 시 광고 정리 (페이지를 벗어날 때만 정리)
    return () => {
      // 언마운트 시 cleanup은 하지 않음 (다른 페이지에서 사용할 수 있도록)
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  const handleNext = async () => {
    if (localScenario.importantMoment.trim() && localScenario.alternativeChoice.trim()) {
      // 로딩 페이지로 이동 (API 호출은 LoadingPage에서만 실행)
      navigate('/loading');
    }
  };

  return (
    <div className="scenario-input-page">
      {/* 상단 타이틀 */}
      <div className="page-title">
        <h1>찾고 싶은 멀티버스를 입력하세요</h1>
      </div>

      {/* 입력 섹션 */}
      <div className="form-section">
        {/* 중요한 순간 */}
        <div className="input-group">
          <label className="input-label">중요한 순간</label>
          <textarea
            className="textarea-input"
            placeholder="나의 인생에서 큰 선택이 있었던 순간에 대한 이야기를 입력하세요 (예시. 두 곳의 회사 중 현재 회사를 선택했다)"
            value={localScenario.importantMoment}
            onChange={(e) => handleInputChange('importantMoment', e.target.value)}
            rows={6}
          />
        </div>

        {/* 만약 내가 그 때 ... 했다면? */}
        <div className="input-group">
          <label className="input-label">만약 내가 그 때 ... 했다면?</label>
          <textarea
            className="textarea-input"
            placeholder="현재 멀티버스에서와는 다른 그 때의 선택을 입력하세요. (예시. 다른 회사를 선택했다면)"
            value={localScenario.alternativeChoice}
            onChange={(e) => handleInputChange('alternativeChoice', e.target.value)}
            rows={6}
          />
        </div>

        {/* 그 때 생각 한 줄 */}
        <div className="input-group">
          <label className="input-label">그 때 생각 한 줄</label>
          <input
            type="text"
            className="text-input"
            placeholder="그 때 어떤 생각했나요 (예시. 긴장되었다)"
            value={localScenario.thoughtAtThatTime}
            onChange={(e) => handleInputChange('thoughtAtThatTime', e.target.value)}
          />
        </div>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="bottom-navigation">
        <button className="back-button" onClick={handleBack}>
          이전
        </button>
        <button className="next-button" onClick={handleNext}>
          찾으러 가기
        </button>
      </div>
    </div>
  );
};

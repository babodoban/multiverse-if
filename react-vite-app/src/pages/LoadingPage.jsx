import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import './LoadingPage.css';

const TIMEOUT_SECONDS = 30; // 30초 타임아웃

// 광고 그룹 ID (환경 변수 또는 하드코딩)
const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || '<AD_GROUP_ID>';

// 광고 로드 상태를 전역적으로 공유하기 위한 간단한 스토어 (ScenarioInputPage와 동일)
const adStateStore = {
  adLoaded: false,
  adCleanup: null,
};

export const LoadingPage = () => {
  const navigate = useNavigate();
  const { generateStory, loadingState, clearError, resultInfo } = useAppContext();
  const [showBackButton, setShowBackButton] = useState(false);
  const timeoutRef = useRef(null);
  const hasStartedRef = useRef(false); // 컴포넌트 마운트 시 한 번만 실행되도록 보장
  const adShownRef = useRef(false); // 광고 표시 여부 (중복 표시 방지)

  // 결과 확인 및 페이지 이동 함수 (showAd보다 먼저 정의)
  const checkAndNavigate = useCallback(() => {
    // API 응답이 완료되었는지 확인
    if (!loadingState.isLoading && !loadingState.error && resultInfo.story) {
      // 응답 완료 → 결과 페이지로 이동
      console.log('[LoadingPage] API 응답 완료 - 결과 페이지로 이동');
      navigate('/result');
    } else {
      // 응답 미완료 → 로딩 화면 유지 (이미 로딩 화면이므로 추가 처리 불필요)
      console.log('[LoadingPage] API 응답 대기 중 - 로딩 화면 유지');
    }
  }, [loadingState.isLoading, loadingState.error, resultInfo.story, navigate]);

  // 광고 표시 함수
  const showAd = useCallback(() => {
    // 이미 광고를 표시했으면 무시
    if (adShownRef.current) {
      return;
    }

    // GoogleAdMob 객체 및 showAppsInTossAdMob 함수 존재 여부 확인
    if (!GoogleAdMob || !GoogleAdMob.showAppsInTossAdMob) {
      console.log('[LoadingPage] GoogleAdMob showAppsInTossAdMob이 사용할 수 없습니다. 광고 없이 진행합니다.');
      // 광고 표시 실패 시 결과 확인 후 이동
      checkAndNavigate();
      return;
    }

    // isSupported 함수 존재 여부 확인 (웹 환경에서는 없을 수 있음)
    if (!GoogleAdMob.showAppsInTossAdMob.isSupported) {
      console.log('[LoadingPage] 광고 표시 지원 함수가 없습니다. 광고 없이 진행합니다.');
      checkAndNavigate();
      return;
    }

    // 안전하게 isSupported 체크 (웹 브라우저에서는 에러 발생 가능)
    let isSupported = false;
    try {
      isSupported = GoogleAdMob.showAppsInTossAdMob.isSupported() === true;
    } catch (error) {
      // 웹 브라우저 환경에서 발생하는 에러 - 광고 없이 진행
      console.log('[LoadingPage] 광고 표시 지원 여부 확인 실패. 광고 없이 진행합니다.', error.message || error);
      checkAndNavigate();
      return;
    }

    if (!isSupported) {
      console.log('[LoadingPage] 광고 표시가 지원되지 않는 환경입니다. 광고 없이 진행합니다.');
      checkAndNavigate();
      return;
    }

    // 광고 로드 상태 확인
    if (!adStateStore.adLoaded) {
      console.log('[LoadingPage] 광고가 아직 로드되지 않았습니다. 광고 없이 진행합니다.');
      checkAndNavigate();
      return;
    }

    // 광고 표시 플래그 설정
    adShownRef.current = true;

    try {
      // 전면형 광고 표시
      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event) => {
          console.log('[LoadingPage] 광고 표시 이벤트:', event.type);
          switch (event.type) {
            case 'dismissed':
              console.log('[LoadingPage] 광고 닫힘 - 결과 확인 후 이동');
              // 광고 닫힘 후 API 응답 상태 확인하여 이동
              checkAndNavigate();
              break;
            case 'failed_to_show':
              console.log('[LoadingPage] 광고 표시 실패. 광고 없이 진행합니다.');
              // 광고 표시 실패 시 결과 확인 후 이동
              checkAndNavigate();
              break;
          }
        },
        onError: (error) => {
          console.log('[LoadingPage] 광고 표시 오류. 광고 없이 진행합니다.', error);
          // 광고 오류 발생 시 결과 확인 후 이동
          checkAndNavigate();
        },
      });
    } catch (error) {
      console.log('[LoadingPage] 광고 표시 함수 호출 실패. 광고 없이 진행합니다.', error);
      checkAndNavigate();
    }
  }, [checkAndNavigate]);

  useEffect(() => {
    // 버튼 상태 초기화
    setShowBackButton(false);
    
    // 이미 시작했으면 무시 (React Strict Mode에서 발생하는 이중 호출 방지)
    if (hasStartedRef.current) {
      return;
    }

    // 이미 로딩 중이면 무시 (다른 경로로 이미 시작된 경우)
    if (loadingState.isLoading) {
      return;
    }

    // 시작 플래그 설정 (즉시 설정하여 중복 실행 방지)
    hasStartedRef.current = true;
    
    // API 호출 시작 (한 번만 실행)
    const loadStory = async () => {
      // 타임아웃 설정 (30초) - API 호출 시작 시점
      timeoutRef.current = setTimeout(() => {
        console.log(`⏱️ 타임아웃 발생 (${TIMEOUT_SECONDS}초)`);
        setShowBackButton(true);
      }, TIMEOUT_SECONDS * 1000);

      try {
        await generateStory();
        
        // 성공 시 결과 페이지로 이동은 광고 처리 후 결정
        // 타임아웃 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (error) {
        // 에러는 이미 AppContext에서 처리되어 loadingState.error에 설정됨
        console.error('스토리 생성 실패:', error);
        
        // 타임아웃 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // 에러 발생 시 버튼 표시
        setShowBackButton(true);
      }
    };

    loadStory();

    // 광고 표시 시도 (API 호출과 독립적으로 실행)
    // 광고가 로드되어 있고 아직 표시하지 않았다면 표시
    if (adStateStore.adLoaded && !adShownRef.current) {
      showAd();
    }

    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // 언마운트 시 플래그 리셋 (다시 방문할 수 있도록)
      hasStartedRef.current = false;
      adShownRef.current = false;
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // API 응답 완료 시 결과 페이지로 자동 이동 (광고가 없거나 이미 닫힌 경우)
  useEffect(() => {
    // 광고가 표시되지 않았거나 이미 닫힌 경우, API 응답 완료 시 결과 페이지로 이동
    if (!adShownRef.current && !loadingState.isLoading && !loadingState.error && resultInfo.story) {
      // 타임아웃 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // 버튼 숨기기
      setShowBackButton(false);
      
      // 결과 페이지로 이동
      navigate('/result');
    }
  }, [loadingState.isLoading, loadingState.error, resultInfo.story, navigate]);

  // 에러 또는 타임아웃 발생 시 버튼 표시
  useEffect(() => {
    if (loadingState.error) {
      setShowBackButton(true);
    }
  }, [loadingState.error]);

  // 에러가 발생했을 때 처리
  useEffect(() => {
    if (loadingState.error) {
      // 에러 메시지를 5초 후 자동으로 지우기
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loadingState.error, clearError]);

  // 경과 시간 포맷팅 (초 → 분:초)
  const formatElapsedTime = (seconds) => {
    if (!seconds) return '0초';
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  // 시작화면으로 돌아가기
  const handleGoHome = () => {
    navigate('/if-start');
  };

  return (
    <div className="loading-page">
      <div className="loading-content">
        {/* 파란색 원형 로딩 애니메이션 */}
        <div className="loading-spinner">
          <svg
            className="spinner-circle"
            viewBox="0 0 50 50"
            width="80"
            height="80"
          >
            <circle
              className="spinner-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#3183f6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 로딩 텍스트 */}
        <div className="loading-text">
          <p className="loading-line-1">다른 멀티버스에 있는</p>
          <p className="loading-line-2">나는 찾고 있습니다</p>
        </div>

        {/* 응답 시간 표시 */}
        {loadingState.elapsedTime !== null && loadingState.elapsedTime > 0 && (
          <div className="elapsed-time">
            {formatElapsedTime(loadingState.elapsedTime)}
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {loadingState.error && (
          <div className="error-message">
            <p className="error-text">{loadingState.error}</p>
            <button className="error-retry-button" onClick={() => window.location.reload()}>
              다시 시도
            </button>
          </div>
        )}

        {/* 타임아웃 메시지 표시 */}
        {showBackButton && !loadingState.error && loadingState.isLoading && (
          <div className="error-message">
            <p className="error-text">응답 시간이 지연되고 있습니다.</p>
          </div>
        )}
      </div>

      {/* 시작화면으로 돌아가기 버튼 (에러 또는 타임아웃 시 표시) */}
      {showBackButton && (
        <div className="back-to-home-container">
          <button className="back-to-home-button" onClick={handleGoHome}>
            시작화면으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

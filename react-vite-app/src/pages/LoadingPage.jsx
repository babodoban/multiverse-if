import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import './LoadingPage.css';

const TIMEOUT_SECONDS = 10; // 10초 타임아웃

export const LoadingPage = () => {
  const navigate = useNavigate();
  const { generateStory, loadingState, clearError, resultInfo } = useAppContext();
  const [showBackButton, setShowBackButton] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // 버튼 상태 초기화
    setShowBackButton(false);

    const loadStory = async () => {
      // 타임아웃 설정 (10초) - API 호출 시작 시점
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ 타임아웃 발생 (10초)');
        setShowBackButton(true);
      }, TIMEOUT_SECONDS * 1000);

      try {
        await generateStory();
        // 성공 시 결과 페이지로 이동 (다른 useEffect에서 처리)
        // 타임아웃 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (error) {
        // 에러는 이미 AppContext에서 처리되어 loadingState.error에 설정됨
        // 로딩 화면에서 에러 메시지가 표시되므로 여기서는 추가 처리 불필요
        // 결과 페이지로 이동하지 않고 로딩 화면에 머물러 에러 표시
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

    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [generateStory]);

  // 에러가 없고 로딩이 완료되었을 때만 결과 페이지로 이동
  useEffect(() => {
    if (!loadingState.isLoading && !loadingState.error && resultInfo.story) {
      // 타임아웃 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // 버튼 숨기기
      setShowBackButton(false);
      
      // 광고 시청 단계는 여기에 구현 가능
      // API 응답 후 광고 시청 → navigate('/result')
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
    navigate('/');
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

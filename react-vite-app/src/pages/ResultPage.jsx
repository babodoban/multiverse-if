import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import './ResultPage.css';

export const ResultPage = () => {
  const navigate = useNavigate();
  const { resultInfo, resetScenario } = useAppContext();
  const textareaRef = useRef(null);
  const messageTextareaRef = useRef(null);
  const summaryTextareaRef = useRef(null); // 한 줄 요약용 ref 추가
  const relationshipTextareaRef = useRef(null); // 연애상태용 ref 추가

  useEffect(() => {
    if (textareaRef.current) {
      // 내용에 맞춰 높이 자동 조정
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    if (messageTextareaRef.current) {
      messageTextareaRef.current.style.height = 'auto';
      messageTextareaRef.current.style.height = `${messageTextareaRef.current.scrollHeight}px`;
    }
    if (summaryTextareaRef.current) {
      // 한 줄 요약 높이 자동 조정
      summaryTextareaRef.current.style.height = 'auto';
      summaryTextareaRef.current.style.height = `${summaryTextareaRef.current.scrollHeight}px`;
    }
    if (relationshipTextareaRef.current) {
      // 연애상태 높이 자동 조정
      relationshipTextareaRef.current.style.height = 'auto';
      relationshipTextareaRef.current.style.height = `${relationshipTextareaRef.current.scrollHeight}px`;
    }
  }, [resultInfo.story, resultInfo.message, resultInfo.summary, resultInfo.relationship]);

  const handleRestart = () => {
    resetScenario(); // 시나리오만 초기화 (기본정보는 유지)
    navigate('/scenario');
  };

  const handleShare = () => {
    // 공유 기능 구현
    const shareText = `멀티버스 이름: ${resultInfo.multiverseName}\n한 줄 요약: ${resultInfo.summary}\n키워드: ${resultInfo.keywords}\n직업: ${resultInfo.job}\n위치: ${resultInfo.location}\n연애상태: ${resultInfo.relationship}\n\n또 다른 나의 이야기:\n${resultInfo.story}\n\n내가 나에게 전하는 이야기:\n${resultInfo.message}`;
    
    if (navigator.share) {
      navigator.share({
        title: '멀티버스 이야기',
        text: shareText,
      }).catch(() => {
        // 공유 실패 시 클립보드에 복사
        navigator.clipboard.writeText(shareText);
        alert('클립보드에 복사되었습니다.');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('클립보드에 복사되었습니다.');
    }
  };

  return (
    <div className="result-page">
      {/* 상단 타이틀 */}
      <div className="page-title">
        <h1>다른 멀티버스의 나를 찾았습니다</h1>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="form-section">
        {/* 멀티버스 이름 */}
        <div className="input-group">
          <label className="input-label">멀티버스 이름</label>
          <input
            type="text"
            className="display-input"
            value={resultInfo.multiverseName}
            readOnly
          />
        </div>

        {/* 한 줄 요약 */}
        <div className="input-group">
          <label className="input-label">한 줄 요약</label>
          <textarea
            ref={summaryTextareaRef}
            className="display-textarea"
            value={resultInfo.summary}
            readOnly
            rows={1}
          />
        </div>

        {/* 키워드 */}
        <div className="input-group">
          <label className="input-label">키워드</label>
          <input
            type="text"
            className="display-input"
            value={resultInfo.keywords}
            readOnly
          />
        </div>

        {/* 직업 */}
        <div className="input-group">
          <label className="input-label">직업</label>
          <input
            type="text"
            className="display-input"
            value={resultInfo.job}
            readOnly
          />
        </div>

        {/* 위치 */}
        <div className="input-group">
          <label className="input-label">위치</label>
          <input
            type="text"
            className="display-input"
            value={resultInfo.location}
            readOnly
          />
        </div>

        {/* 연애상태 */}
        <div className="input-group">
          <label className="input-label">연애상태</label>
          <textarea
            ref={relationshipTextareaRef}
            className="display-textarea"
            value={String(resultInfo.relationship || '')}
            readOnly
            rows={1}
          />
        </div>

        {/* 또 다른 나의 이야기 */}
        <div className="input-group">
          <label className="input-label">또 다른 나의 이야기</label>
          <textarea
            ref={textareaRef}
            className="display-textarea"
            value={typeof resultInfo.story === 'string' ? resultInfo.story : String(resultInfo.story || '')}
            readOnly
          />
        </div>

        {/* 내가 나에게 전하는 이야기 */}
        <div className="input-group">
          <label className="input-label">내가 나에게 전하는 이야기</label>
          <textarea
            ref={messageTextareaRef}
            className="display-textarea"
            value={resultInfo.message}
            readOnly
          />
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="bottom-navigation">
        <button className="restart-button" onClick={handleRestart}>
          다시 입력하기
        </button>
        <button className="share-button" onClick={handleShare}>
          공유하기
        </button>
      </div>
    </div>
  );
};

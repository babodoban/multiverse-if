import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/basic-info');
  };

  return (
    <div className="landing-page">
      {/* 상단 타이틀 섹션 */}
      <div className="title-section">
        <p className="subtitle">만약 내가 그 때 ... 했다면</p>
        <div className="main-title">
          <p>다른 멀티버스에 있는</p>
          <p>나는 어떻게 살고 있을까</p>
        </div>
      </div>

      {/* 중간 섹션 */}
      <div className="content-section">
        <div className="section-title">
          <p className="heading">지금 바로</p>
          <p className="heading">다른 멀티버스의 나를 찾아보세요</p>
        </div>

        <div className="steps-list">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-title">기본 정보를 입력하세요</div>
              <p className="step-description">
                직업, 성별, 관심사 등 현재 멀티버스의 나를 알려주세요
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-title">찾고 싶은 멀티버스를 입력하세요</div>
              <p className="step-description">
                인생의 한 순간, 다른 선택을 한 나의 이야기를 들려주세요
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-title">다른 멀티버스의 나를 만나보세요</div>
              <p className="step-description">
                AI가 찾아낸 또 다른 나의 이야기를 읽어보세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 CTA 버튼 */}
      <div className="cta-section">
        <button className="start-button" onClick={handleStart}>
          시작하기
        </button>
      </div>
    </div>
  );
};

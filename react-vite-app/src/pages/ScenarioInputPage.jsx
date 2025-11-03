import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import './ScenarioInputPage.css';

export const ScenarioInputPage = () => {
  const navigate = useNavigate();
  const { scenario, updateScenario } = useAppContext();

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

  const handleNext = () => {
    if (localScenario.importantMoment.trim() && localScenario.alternativeChoice.trim()) {
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
            placeholder="그 떄 어떤 생각했나요 (예시. 긴장되었다)"
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
          다음
        </button>
      </div>
    </div>
  );
};

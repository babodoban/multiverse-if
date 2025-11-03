import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import './BasicInfoPage.css';

export const BasicInfoPage = () => {
  const navigate = useNavigate();
  const { basicInfo, updateBasicInfo } = useAppContext();

  const [localInfo, setLocalInfo] = useState({
    job: basicInfo.job || '',
    gender: basicInfo.gender || '',
    interests: basicInfo.interests || '',
    relationship: basicInfo.relationship || '',
    children: basicInfo.children || '',
  });

  const handleInputChange = (field, value) => {
    const updated = { ...localInfo, [field]: value };
    setLocalInfo(updated);
    updateBasicInfo({ [field]: value });
  };

  const handleGenderChange = (gender) => {
    handleInputChange('gender', gender);
  };

  const handleRelationshipChange = (relationship) => {
    handleInputChange('relationship', relationship);
  };

  const handleChildrenChange = (children) => {
    handleInputChange('children', children);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleNext = () => {
    navigate('/scenario');
  };

  return (
    <div className="basic-info-page">
      {/* 상단 타이틀 */}
      <div className="page-title">
        <h1>기본 정보를 입력하세요</h1>
      </div>

      {/* 입력 섹션들 */}
      <div className="form-section">
        {/* 직업 */}
        <div className="input-group">
          <label className="input-label">직업</label>
          <input
            type="text"
            className="text-input"
            placeholder="현재 하고 있는 일을 입력하세요 (예시. 학생)"
            value={localInfo.job}
            onChange={(e) => handleInputChange('job', e.target.value)}
          />
        </div>

        {/* 성별 */}
        <div className="input-group">
          <label className="input-label">성별</label>
          <div className="button-group">
            <button
              className={`option-button ${localInfo.gender === '남성' ? 'selected' : ''}`}
              onClick={() => handleGenderChange('남성')}
            >
              남성
            </button>
            <button
              className={`option-button ${localInfo.gender === '여성' ? 'selected' : ''}`}
              onClick={() => handleGenderChange('여성')}
            >
              여성
            </button>
          </div>
        </div>

        {/* 관심사 */}
        <div className="input-group">
          <label className="input-label">관심사</label>
          <input
            type="text"
            className="text-input"
            placeholder="현재 관심사들을 입력하세요 (예시. 영화, 음악)"
            value={localInfo.interests}
            onChange={(e) => handleInputChange('interests', e.target.value)}
          />
        </div>

        {/* 연애상태 */}
        <div className="input-group">
          <label className="input-label">연애상태</label>
          <div className="button-group">
            <button
              className={`option-button ${localInfo.relationship === '혼자' ? 'selected' : ''}`}
              onClick={() => handleRelationshipChange('혼자')}
            >
              혼자
            </button>
            <button
              className={`option-button ${localInfo.relationship === '연애중' ? 'selected' : ''}`}
              onClick={() => handleRelationshipChange('연애중')}
            >
              연애중
            </button>
            <button
              className={`option-button ${localInfo.relationship === '결혼함' ? 'selected' : ''}`}
              onClick={() => handleRelationshipChange('결혼함')}
            >
              결혼함
            </button>
            <button
              className={`option-button ${localInfo.relationship === '다시 혼자' ? 'selected' : ''}`}
              onClick={() => handleRelationshipChange('다시 혼자')}
            >
              혼자됨
            </button>
          </div>
        </div>

        {/* 자녀 */}
        <div className="input-group">
          <label className="input-label">자녀</label>
          <div className="button-group">
            <button
              className={`option-button ${localInfo.children === '없음' ? 'selected' : ''}`}
              onClick={() => handleChildrenChange('없음')}
            >
              없음
            </button>
            <button
              className={`option-button ${localInfo.children === '1명' ? 'selected' : ''}`}
              onClick={() => handleChildrenChange('1명')}
            >
              1명
            </button>
            <button
              className={`option-button ${localInfo.children === '2명' ? 'selected' : ''}`}
              onClick={() => handleChildrenChange('2명')}
            >
              2명
            </button>
            <button
              className={`option-button ${localInfo.children === '3명 이상' ? 'selected' : ''}`}
              onClick={() => handleChildrenChange('3명 이상')}
            >
              이상
            </button>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="bottom-navigation">
        <button className="back-button" onClick={handleBack}>
          처음으로
        </button>
        <button className="next-button" onClick={handleNext}>
          저장하고 다음
        </button>
      </div>
    </div>
  );
};

import React from "react";
import "./style.css";

export const IphoneMini = () => {
  return (
    <div className="iphone-mini">
      <div className="frame">
        <div className="title">
          <div className="text-wrapper">기본 정보를 입력하세요</div>
        </div>

        <div className="div">
          <div className="text-wrapper-2">직업</div>

          <div className="title-line">
            <p className="p">현재 하고 있는 일을 입력하세요 (예시. 학생)</p>
          </div>
        </div>

        <div className="div">
          <div className="text-wrapper-2">성별</div>

          <div className="frame-2">
            <div className="div-wrapper">
              <div className="text-wrapper-3">남성</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">여성</div>
            </div>
          </div>
        </div>

        <div className="div">
          <div className="text-wrapper-2">관심사</div>

          <div className="title-line">
            <p className="p">현재 관심사들을 입력하세요 (예시. 영화, 음악)</p>
          </div>
        </div>

        <div className="div">
          <div className="text-wrapper-2">연애상태</div>

          <div className="frame-2">
            <div className="div-wrapper">
              <div className="text-wrapper-3">혼자</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">연애중</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">결혼함</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">다시 혼자</div>
            </div>
          </div>
        </div>

        <div className="div">
          <div className="text-wrapper-2">자녀</div>

          <div className="frame-2">
            <div className="div-wrapper">
              <div className="text-wrapper-3">없음</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">1명</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">2명</div>
            </div>

            <div className="frame-3">
              <div className="text-wrapper-3">3명 이상</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-CTA">
        <div className="frame-4">
          <div className="frame-5">
            <div className="text-wrapper-4">처음으로</div>
          </div>

          <div className="frame-6">
            <div className="text-wrapper-5">저장하고 다음</div>
          </div>
        </div>
      </div>
    </div>
  );
};

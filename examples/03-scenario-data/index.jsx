import React from "react";
import "./style.css";

export const IphoneMini = () => {
  return (
    <div className="iphone-mini">
      <div className="frame">
        <div className="title">
          <div className="text-wrapper">찾고 싶은 멀티버스를 입력하세요</div>
        </div>

        <div className="div">
          <div className="text-wrapper-2">중요한 순간</div>

          <div className="title-line">
            <p className="p">
              나의 인생에서 큰 선택이 있었던 순간에 대한 이야기를 입력하세요
              (예시. 두 곳의 회사 중 현재 회사를 선택했다)
            </p>
          </div>
        </div>

        <div className="div">
          <p className="text-wrapper-2">만약 내가 그 때 ... 했다면?</p>

          <div className="title-line">
            <p className="p">
              현재 멀티버스에서와는 다른 그 때의 선택을 입력하세요. (예시. 다른
              회사를 선택했다면)
            </p>
          </div>
        </div>
      </div>

      <div className="bottom-CTA">
        <div className="frame-2">
          <div className="div-wrapper">
            <div className="text-wrapper-3">이전</div>
          </div>

          <div className="frame-3">
            <div className="text-wrapper-4">다음</div>
          </div>
        </div>
      </div>
    </div>
  );
};
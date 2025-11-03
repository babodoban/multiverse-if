import React from "react";
import "./style.css";

export const IphoneMini = () => {
  return (
    <div className="iphone-mini">
      <div className="bottom-CTA">
        <div className="frame">
          <div className="text-wrapper">시작하기</div>
        </div>
      </div>

      <div className="title">
        <p className="div">만약 내가 그 때 ... 했다면</p>

        <p className="p">
          다른 멀티버스에 있는 <br />
          나는 어떻게 살고 있을까
        </p>
      </div>

      <div className="frame-2">
        <div className="frame-3">
          <div className="div-wrapper">
            <div className="text-wrapper-2">1</div>
          </div>

          <div className="title-line">
            <div className="text-wrapper-3">기본 정보를 입력하세요</div>

            <p className="text-wrapper-4">
              직업, 성별, 관심사 등 현재 멀티버스의 나를 알려주세요
            </p>
          </div>
        </div>

        <div className="frame-3">
          <div className="div-wrapper">
            <div className="text-wrapper-2">2</div>
          </div>

          <div className="title-line">
            <div className="text-wrapper-3">
              찾고 싶은 멀티버스를 입력하세요
            </div>

            <p className="text-wrapper-4">
              인생의 한 순간, 다른 선택을 한 나의 이야기를 들려주세요
            </p>
          </div>
        </div>

        <div className="frame-3">
          <div className="div-wrapper">
            <div className="text-wrapper-2">3</div>
          </div>

          <div className="title-line">
            <div className="text-wrapper-3">
              다른 멀티버스의 나를 만나보세요
            </div>

            <p className="text-wrapper-4">
              AI가 찾아낸 또 다른 나의 이야기를 읽어보세요
            </p>
          </div>
        </div>
      </div>

      <div className="title-2">
        <p className="text-wrapper-5">
          지금 바로 <br />
          다른 멀티버스의 나를 찾아보세요
        </p>
      </div>
    </div>
  );
};

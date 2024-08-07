import React from "react";

interface BtnProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Btn: React.FC<BtnProps> = ({ onClick }) => {
  return (
    <div className="mx-3">
      <button
        onClick={onClick}
        className="px-2 py-2 text-sm font-bold text-white rounded-lg bg-sky-500"
      >
        조회
      </button>
    </div>
  );
};

export default Btn;

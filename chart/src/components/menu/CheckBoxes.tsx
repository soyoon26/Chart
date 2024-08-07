import React, { useState, useEffect } from "react";

interface CheckBoxesProps {
  onChange: (selectedOptions: string[]) => void;
}

const CheckBoxes: React.FC<CheckBoxesProps> = ({ onChange }) => {
  const options = [
    "전국",
    "서울",
    "대전",
    "대구",
    "부산",
    "광주",
    "울산",
    "인천",
    "세종",
    "경기도",
    "충청북도",
    "충청남도",
    "경상북도",
    "경상남도",
    "전라북도",
    "전라남도",
    "강원도",
    "제주도",
  ];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleCheckboxChange = (option: string) => {
    setSelectedOptions(
      (
        prevSelectedOptions //이전 선택 옵션 배열
      ) =>
        prevSelectedOptions.includes(option)
          ? prevSelectedOptions.filter((o) => o !== option) // 새 배열 만들기
          : [...prevSelectedOptions, option]
    );
  };

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions, onChange]);

  return (
    <div className="flex flex-wrap w-full">
      {options.map((option, index) => (
        <div className="flex items-center w-1/9" key={index}>
          <input
            type="checkbox"
            id={`checkbox-${index}`}
            value={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleCheckboxChange(option)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`checkbox-${index}`} // 어떤 체크박스와 연결되어있는지
            className="ms-2 text-sm font-medium w-[60px] text-gray-900 text-left dark:text-gray-300"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckBoxes;

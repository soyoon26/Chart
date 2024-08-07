import React, { useState, useEffect, useRef } from "react";

interface DropDownProps {
  text: string;
  onOptionSelected: (selectedOption: string) => void; // 선택된 옵션 전달
}

const DropDown: React.FC<DropDownProps> = ({ text, onOptionSelected }) => {
  const options = ["선택 안 함", "출생수", "죽음수", "이혼수", "결혼수"];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select Variable");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    onOptionSelected(selectedOption);
  }, [selectedOption, onOptionSelected]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) // 클릭이 내부에 없으면 닫기
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block w-full text-left" ref={dropdownRef}>
      <div className="mr-3">
        <button
          type="button"
          className="inline-flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleMenu}
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">{text}</span>
            <span>{selectedOption}</span>
          </div>
          {/* 화살표 */}

          <svg
            className="w-5 h-5 -mr-1 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="none">
            {options.map((option, index) => (
              <a
                key={index}
                className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropDown;

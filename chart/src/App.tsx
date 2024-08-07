import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import DropDown from "./components/menu/DropDown";
import Btn from "./components/menu/Btn";
import CheckBoxes from "./components/menu/CheckBoxes";
import PieChart from "./components/graphs/PieChart";
import BarChart from "./components/graphs/BarChart";
import LineChart from "./components/graphs/LineChart";

function App() {
  // 선택된 체크박스
  const [selectedCheckBoxes, setSelectedCheckBoxes] = useState<string[]>([]);
  const handleCheckBoxChange = (selectedOptions: string[]) => {
    setSelectedCheckBoxes(selectedOptions);
  };

  // 선택된 라인 차트
  const [selectedLine, setSelectedLine] = useState<string>("");
  const handleSelectedLine = (option: string) => {
    setSelectedLine(option);
  };

  // 선택된 바 차트
  const [selectedBar, setSelectedBar] = useState<string>("");
  const handleSelectedBar = (option: string) => {
    setSelectedBar(option);
  };

  // 선택된 파이 차트
  const [selectedPie, setSelectedPie] = useState<string>("");
  const handleSelectedPie = (option: string) => {
    setSelectedPie(option);
  };

  // 조회 버튼 클릭 후 상태 저장
  const [displayedCheckBoxes, setDisplayedCheckBoxes] = useState<string[]>([]);
  const [displayedLine, setDisplayedLine] = useState<string>("");
  const [displayedBar, setDisplayedBar] = useState<string>("");
  const [displayedPie, setDisplayedPie] = useState<string>("");

  const handleDisplay: React.MouseEventHandler<HTMLButtonElement> = () => {
    setDisplayedCheckBoxes(selectedCheckBoxes);
    setDisplayedLine(selectedLine);
    setDisplayedBar(selectedBar);
    setDisplayedPie(selectedPie);
  };

  // 크기
  const barContainerRef = useRef<HTMLDivElement | null>(null);
  const pieContainerRef = useRef<HTMLDivElement | null>(null);
  const lineContainerRef = useRef<HTMLDivElement | null>(null);

  const [barSize, setBarSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [pieSize, setPieSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [lineSize, setLineSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      if (barContainerRef.current) {
        const { clientWidth, clientHeight } = barContainerRef.current;
        setBarSize({ width: clientWidth, height: clientHeight });
      }
      if (pieContainerRef.current) {
        const { clientWidth, clientHeight } = pieContainerRef.current;
        setPieSize({ width: clientWidth, height: clientHeight });
      }
      if (lineContainerRef.current) {
        const { clientWidth, clientHeight } = lineContainerRef.current;
        setLineSize({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div className="flex flex-col w-full min-w-[1000px] h-dvh">
      <header className="flex p-2 mx-2 bg-gray-100 ">
        <nav className="flex items-center w-2/3">
          <div className="flex items-center justify-center w-24 m-1">지역</div>
          <CheckBoxes onChange={handleCheckBoxChange} />
        </nav>
        <nav className="flex items-center justify-around w-1/3">
          <div className="w-2/5">
            <DropDown
              onOptionSelected={handleSelectedLine}
              text={"Line Chart 변수"}
            />
          </div>
          <div className="w-2/5">
            <DropDown
              onOptionSelected={handleSelectedBar}
              text={"Bar Chart 변수"}
            />
          </div>
          <div className="w-2/5">
            <DropDown
              onOptionSelected={handleSelectedPie}
              text={"Pie Chart 변수"}
            />
          </div>
          <div className="w-1/5">
            <Btn onClick={handleDisplay} />
          </div>
        </nav>
      </header>
      <main className="flex flex-col flex-grow">
        <article className="flex-1 m-2">
          <section
            ref={lineContainerRef}
            className="flex items-center justify-center w-full h-full border-2 border-black rounded-lg"
          >
            <LineChart
              selectedLine={displayedLine}
              selectedCheckBoxes={displayedCheckBoxes}
              width={lineSize.width}
              height={lineSize.height}
            />
          </section>
        </article>
        <article className="flex flex-1 mx-2 mb-2">
          <section
            ref={barContainerRef}
            className="flex items-center justify-center w-3/5 h-full mr-1 border-2 border-black rounded-lg"
          >
            <BarChart
              selectedBar={displayedBar}
              selectedCheckBoxes={displayedCheckBoxes}
              width={barSize.width}
              height={barSize.height}
            />
          </section>
          <section
            ref={pieContainerRef}
            className="flex items-center justify-center w-2/5 h-full ml-1 border-2 border-black rounded-lg"
          >
            <PieChart
              selectedPie={displayedPie}
              width={pieSize.width}
              height={pieSize.height}
            />
          </section>
        </article>
      </main>
    </div>
  );
}

export default App;

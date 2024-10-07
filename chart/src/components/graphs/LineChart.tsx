import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import GetRegion from "../common/GetRegion";
import rawData from "./data.json";

// 출생률
interface DataPoint {
  Date: Date;
  Region: string;
  Birth: number;
  Death: number;
  Divorce: number;
  Marriage: number;
  Natural_growth: number;
}

interface RawDataPoint extends Omit<DataPoint, "Date"> {
  Date: string;
}

interface LineChartProps {
  selectedLine: string;
  selectedCheckBoxes: string[];
  width: number;
  height: number;
}

const LineChart: React.FC<LineChartProps> = ({
  selectedLine,
  selectedCheckBoxes,
  height,
  width,
}) => {
  const [selectedEng, setSelectedEng] = useState<string[]>([]); // 영어 선택 지역
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [_, setXScale] = useState<d3.ScaleTime<number, number>>(
    d3.scaleTime<number, number>()
  );
  const [__, setYScale] = useState<d3.ScaleLinear<number, number>>(
    d3.scaleLinear<number, number>()
  );

  const data: DataPoint[] = (rawData as RawDataPoint[]).map((d) => ({
    ...d,
    Date: new Date(d.Date), // 문자열 날짜를 Date 객체로 변환
  }));

  const [___, setSelectedEngCategory] = useState<string>("");

  useEffect(() => {
    switch (selectedLine) {
      case "선택 안 함":
        setSelectedEngCategory("");
        break;
      case "출생수":
        setSelectedEngCategory("Birth");
        break;
      case "죽음수":
        setSelectedEngCategory("Death");
        break;
      case "이혼수":
        setSelectedEngCategory("Divorce");
        break;
      case "결혼수":
        setSelectedEngCategory("Marriage");
        break;
      default:
        setSelectedEngCategory("");
    }
  }, [selectedLine]);

  useEffect(() => {
    const EngRegions = GetRegion(selectedCheckBoxes);
    setSelectedEng(EngRegions);
  }, [selectedCheckBoxes]);

  useEffect(() => {
    if (selectedEng.length > 0 && svgRef.current && tooltipRef.current) {
      const svg = d3.select(svgRef.current);
      const tooltip = d3.select(tooltipRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // 선택된 지역의 데이터만 필터링
      const filteredData: DataPoint[] = data.filter((d) =>
        selectedEng.includes(d.Region)
      );

      const x = d3
        .scaleTime()
        .domain(d3.extent(filteredData, (d) => d.Date) as [Date, Date])
        .range([0, innerWidth]);
      setXScale(x);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(filteredData, (d) => d.Birth)!])
        .range([innerHeight, 0]);
      setYScale(y);

      // 축
      const xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1));
      const yAxis = d3.axisLeft(y);

      const line = d3
        .line<DataPoint>()
        .x((d) => x(d.Date))
        .y((d) => y(d.Birth));

      // 차트 영역 클리핑
      svg
        .append("defs") // definitions 그래픽 객체 정의
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // 축 추가
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle");

      g.append("g").attr("class", "y-axis").call(yAxis);

      const categories = ["Birth", "Death", "Divorce", "Marriage"];
      const color = d3.scaleOrdinal(d3.schemeCategory10).domain(selectedEng);

      // 브러시 추가 (데이터 포인트 앞에 추가)
      const brush = d3
        .brushX()
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ])
        .on("end", updateChart);

      g.append("g").attr("class", "brush").call(brush);

      // 각 지역에 대해 라인 차트 그리기
      selectedEng.forEach((region) => {
        categories.forEach((category) => {
          const regionData = filteredData.filter((d) => d.Region === region);

          // 라인 추가
          const path = g
            .append("path")
            .datum(regionData)
            .attr("class", "line")
            .attr("clip-path", "url(#clip)")
            .attr("fill", "none")
            .attr("stroke", color(region) as string)
            .attr("stroke-width", 1.5)
            .attr("d", line(regionData));

          // 툴팁
          path
            .on("mouseover", (event) => {
              const [mouseX] = d3.pointer(event);
              const x0 = x.invert(mouseX);
              const bisectDate = d3.bisector<DataPoint, Date>(
                (d) => d.Date
              ).left;
              const i = bisectDate(regionData, x0, 1);
              const d0 = regionData[i - 1];
              const d1 = regionData[i];
              const d =
                x0.getTime() - d0.Date.getTime() >
                d1.Date.getTime() - x0.getTime()
                  ? d1
                  : d0;
              tooltip
                .html(`${region} : ${d[category as keyof DataPoint]}`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 120}px`)
                .style("opacity", 1);
            })
            .on("mousemove", (event) => {
              tooltip
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 120}px`);
            })
            .on("mouseout", () => {
              tooltip.style("opacity", 0);
            })
            .on("mousedown", function (event) {
              const brushElm = svg.select(".brush").node() as HTMLElement;
              const newClickEvent = new MouseEvent("mousedown", {
                clientX: event.clientX,
                clientY: event.clientY,
              });

              brushElm?.dispatchEvent(newClickEvent); // 존재한다면
            });
        });
      });

      function updateChart(event: any) {
        const extent = event.selection;

        if (!extent) {
          return;
        }

        const newStartIdx = x.invert(extent[0]);
        const newEndIdx = x.invert(extent[1]);

        x.domain([newStartIdx, newEndIdx]);

        g.select<SVGGElement>(".x-axis").call(xAxis.scale(x));
        g.selectAll<SVGPathElement, DataPoint>(".line").attr("d", (d) =>
          line(d as unknown as DataPoint[])
        );

        g.select<SVGGElement>(".brush").call(brush.move, null as any);
      }

      svg.on("dblclick", function () {
        x.domain(d3.extent(filteredData, (d) => d.Date) as [Date, Date]);
        g.select<SVGGElement>(".x-axis").call(xAxis.scale(x));
        g.selectAll<SVGPathElement, DataPoint>(".line").attr("d", (d) =>
          line(d as unknown as DataPoint[])
        );
      });
    }
  }, [selectedEng, width, height, data]);

  return (
    <div>
      {selectedCheckBoxes.length > 0 ? (
        <div style={{ position: "relative" }}>
          <svg ref={svgRef} width={width} height={height}></svg>
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              textAlign: "center",
              width: "120px",
              height: "auto",
              padding: "5px",
              font: "12px sans-serif",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              pointerEvents: "none",
              opacity: 0,
            }}
          ></div>
        </div>
      ) : (
        <p>지역을 선택해주세요.</p>
      )}
    </div>
  );
};

export default LineChart;

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "./data.json";
import { schemePaired } from "d3-scale-chromatic";
import getLatestData from "../common/Latest";
import GetRegion from "../common/GetRegion";

interface DataPoint {
  Date: string;
  Region: string;
  Birth: number;
  Death: number;
  Divorce: number;
  Marriage: number;
  Natural_growth: number;
}

interface BarChartProps {
  selectedBar: string;
  selectedCheckBoxes: string[];
  width: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({
  selectedBar,
  selectedCheckBoxes,
  width,
  height,
}) => {
  const rawLatestData: any[] = getLatestData(data);
  const latestData: DataPoint[] = rawLatestData.map((item) => ({
    Date: item.Date,
    Region: item.Region,
    Birth: item.Birth,
    Death: item.Death,
    Divorce: item.Divorce,
    Marriage: item.Marriage,
    Natural_growth: item.Natural_growth,
  }));

  const [selectedEng, setSelectedEng] = useState<string>(""); // 선택한 변수 영어로
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]); // 선택 지역

  useEffect(() => {
    const EngRegions = GetRegion(selectedCheckBoxes);
    setSelectedRegions(EngRegions);
  }, [selectedCheckBoxes]);

  useEffect(() => {
    switch (selectedBar) {
      case "선택 안 함":
        setSelectedEng("");
        break;
      case "출생수":
        setSelectedEng("Birth");
        break;
      case "죽음수":
        setSelectedEng("Death");
        break;
      case "이혼수":
        setSelectedEng("Divorce");
        break;
      case "결혼수":
        setSelectedEng("Marriage");
        break;
      default:
        setSelectedEng("");
    }
  }, [selectedBar]);

  const getChartData = (
    data: DataPoint[],
    key: string
  ): { Region: string; Value: number }[] => {
    return key
      ? data.map((item) => ({
          Region: item.Region,
          Value: item[key as keyof DataPoint] as number, // 타입 단언 추가
        }))
      : [];
  };

  // 차트 데이터 준비
  let chartData = getChartData(latestData, selectedEng);

  // 선택된 지역이 있으면 해당 지역으로 필터링
  if (selectedRegions.length > 0) {
    chartData = chartData.filter((d) => selectedRegions.includes(d.Region));
  }

  const marginTop = 50;
  const marginBottom = 90;
  const marginRight = 50;
  const marginLeft = 50;

  const max = Math.max(...chartData.map((d) => d.Value));
  const min = Math.min(...chartData.map((d) => d.Value));

  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (svgRef.current && tooltipRef.current) {
      const svg = d3.select(svgRef.current);
      const tooltip = d3.select(tooltipRef.current);

      // 기존 요소 제거
      svg.selectAll("*").remove();

      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);

      const xScale = d3
        .scaleBand()
        .domain(chartData.map((d) => d.Region)) // x축 데이터들 이름
        .range([0, width - marginLeft - marginRight])
        .padding(0.1); // 막대간 간격

      const yScale = d3
        .scaleLinear()
        .domain([min < 0 ? min : 0, max > 0 ? max : 0])
        .range([height - marginTop - marginBottom, 0]);

      const color = d3.scaleOrdinal(schemePaired);
      const mouseover = function (event: MouseEvent, d: any) {
        tooltip
          .html(`<div>${d.Region}: ${d.Value}</div>`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
          .transition()
          .duration(200) // transition
          .style("opacity", 1);
        d3.select(event.currentTarget as Element)
          .transition()
          .duration(200)
          .style("opacity", 0.7);
      };

      const mouseleave = function (event: MouseEvent) {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(event.currentTarget as Element)
          .transition()
          .duration(200)
          .style("opacity", 1);
      };

      // 바 추가
      g.selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.Region)!)
        .attr("y", (d) => (d.Value >= 0 ? yScale(d.Value) : yScale(0)))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.abs(yScale(0) - yScale(d.Value)))
        .attr("fill", (_, i) => color(i.toString()))
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave);

      // x축 추가
      g.append("g")
        .attr("transform", `translate(0,${height - marginTop - marginBottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)") // 길어서 회전시킴
        .style("text-anchor", "end");

      // y축 추가
      g.append("g").call(d3.axisLeft(yScale));

      // 0을 기준으로 하는 x축 추가 - 데이터 음수가 있을 경우
      const zeroAxis = d3
        .axisBottom(xScale)
        .tickSize(0)
        .tickFormat(() => "");
      g.append("g")
        .attr("transform", `translate(0,${yScale(0)})`)
        .call(zeroAxis);
    }
  }, [chartData, height, max, min, width, selectedBar, selectedEng]);

  return (
    <div>
      {selectedEng ? (
        <>
          <svg ref={svgRef}></svg>
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              textAlign: "center",
              width: "120px",
              height: "auto",
              font: "12px sans-serif",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              pointerEvents: "none",
              opacity: 0,
            }}
          ></div>
        </>
      ) : (
        <p>Bar Chart의 변수를 선택해주세요.</p>
      )}
    </div>
  );
};

export default BarChart;

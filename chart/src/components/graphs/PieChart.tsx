import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { schemeSet2 } from "d3-scale-chromatic";
import getLatestData from "../common/Latest";
import data from "./data.json";

interface PieChartProps {
  selectedPie: string;
  width: number;
  height: number;
}

interface DataItem {
  Date: string;
  Region?: string;
  Birth?: number;
  Death?: number;
  Divorce?: number;
  Marriage?: number;
  Natural_growth?: number;
}

const PieChart: React.FC<PieChartProps> = ({ selectedPie, width, height }) => {
  const latestData: DataItem[] = getLatestData(data);
  const [selectedEng, setSelectedEng] = useState<string>("");

  useEffect(() => {
    switch (selectedPie) {
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
  }, [selectedPie]);

  const top5 = latestData
    .filter(
      (item) =>
        item[selectedEng as keyof DataItem] !== undefined &&
        item.Region !== undefined
    )
    .sort(
      (a, b) =>
        (b[selectedEng as keyof DataItem] as number) -
        (a[selectedEng as keyof DataItem] as number)
    )
    .slice(1, 6) // 상위 5개 지역
    .map((d) => ({
      region: d.Region || "",
      value: d[selectedEng as keyof DataItem] as number,
    }));

  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const marginTop = 30;
  const marginBottom = 30;
  const marginRight = 30;
  const marginLeft = 30;

  const drawChart = (data: { region: string; value: number }[]) => {
    const radius =
      Math.min(
        width - marginLeft - marginRight,
        height - marginTop - marginBottom
      ) / 2;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove(); // 이전 차트 제거

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr(
        "transform",
        `translate(${(width - marginLeft - marginRight) / 2 + marginLeft}, ${
          (height - marginTop - marginBottom) / 2 + marginTop
        })`
      );

    const pie = d3
      .pie<{ region: string; value: number }>()
      .value((d) => d.value);

    const arc = d3
      .arc<d3.PieArcDatum<{ region: string; value: number }>>()
      .innerRadius(0)
      .outerRadius(radius * 0.8);

    const outerArc = d3
      .arc<d3.PieArcDatum<{ region: string; value: number }>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.8);

    const color = d3.scaleOrdinal(schemeSet2);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) => color(i.toString()))
      .on("mouseover", function (event, d) {
        tooltip
          .html(`<div>${d.data.value}</div>`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 30}px`)
          .transition()
          .duration(100)
          .style("opacity", 0.9);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(100).style("opacity", 0);
      });

    arcs
      .append("text")
      .attr("dy", ".35em")
      .text((d) => d.data.region)
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", (d) => (midAngle(d) < Math.PI ? "start" : "end"))
      .style("font-size", "12px");

    arcs
      .append("polyline")
      .attr("points", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        const points = [arc.centroid(d), outerArc.centroid(d), pos];
        return points.map((p) => p.join(",")).join(" ");
      })
      .style("opacity", ".3")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("fill", "none");
  };

  const midAngle = (d: d3.PieArcDatum<{ region: string; value: number }>) =>
    d.startAngle + (d.endAngle - d.startAngle) / 2;

  useEffect(() => {
    if (selectedEng) {
      drawChart(top5);
    }
  }, [selectedEng, top5]);
  // 선택한 카테고리로 상위 5개 지역의 비율
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
              width: "80px",
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
        <p>Pie Chart의 변수를 선택해주세요.</p>
      )}
    </div>
  );
};

export default PieChart;

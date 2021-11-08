import React, { useRef, useEffect } from "react";
import worldData from "../../util/custom.json";
import * as d3 from "d3";
import ResizeObserver from "./ResizeObserver";

const svg = d3.select("#world").attr("width", 500).attr("height", 500);
// Draw the map

function Center({ owi, countries, property }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = ResizeObserver(wrapperRef);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    const projection = d3.geoMercator().fitSize([width, height], worldData);
    const pathGenerator = d3.geoPath().projection(projection);

    const minType = d3.min(countries, (d) => d.cases);
    const maxType = d3.max(countries, (d) => d.deaths);

    const colorScale = d3
      .scaleLinear()
      .domain([minType, maxType])
      .range(["#ccc", "#900"]);

    function getCountryValue(name) {
      const country = countries.find((c) => c.country == name);

      if (country != undefined) {
        return country.cases;
      }
    }

    console.log(getCountryValue("Africa"));
    svg
      .selectAll(".country")
      .data(worldData.features)
      .join("path")
      .attr("class", "country")
      .attr("fill", (d) => colorScale(getCountryValue(d.properties.name)))

      .attr("d", (d) => pathGenerator(d));
  }, [owi, dimensions, property, countries]);
  return (
    <div ref={wrapperRef} style={{ marginBottom: "1rem" }} id="world">
      <svg width={900} height={500} ref={svgRef}></svg>
    </div>
  );
}

export default Center;

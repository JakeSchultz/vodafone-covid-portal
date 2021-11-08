import React, { useRef, useEffect, useState } from "react";
import worldData from "../../util/custom.json";
import * as d3 from "d3";
import ResizeObserver from "./UseResizeObserver";

// Draw the map

function Center({ owi, countries, mapData }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = ResizeObserver(wrapperRef);

  //   console.log(mapData);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    const projection = d3
      .geoMercator()
      .fitSize([width, height], selectedCountry || worldData);
    const pathGenerator = d3.geoPath().projection(projection);

    const minType = d3.min(countries, (d) => d.cases);
    const maxType = d3.max(countries, (d) => d.cases);

    const colorScale = d3
      .scaleLinear()
      .domain([minType, maxType])
      .range(["#ccc", "#900"]);

    function getCountryValue(iso) {
      const country = mapData.find((c) => c.iso_code == iso);

      if (country != undefined) {
        const another = countries.find((c) => c.country == country.location);

        if (another) return another.cases;
      }
    }

    svg
      .selectAll(".country")
      .data(worldData.features)
      .join("path")
      .on("click", (feature, d) => {
        setSelectedCountry(selectedCountry === d ? null : d);
      })
      .attr("class", "country")
      .transition()
      .attr("fill", (d) => colorScale(getCountryValue(d.properties.iso_a3)))
      .attr("stroke", "black")
      .attr("d", (d) => pathGenerator(d));
  }, [owi, dimensions, mapData, countries, selectedCountry]);
  return (
    <div
      id="world"
      style={{
        marginBottom: "1rem",
        height: "100%",
      }}
      ref={wrapperRef}
    >
      <svg style={{ width: 900, height: 700 }} ref={svgRef}></svg>
    </div>
  );
}

export default Center;

import React, { useRef, useEffect, useState } from "react";
import worldData from "../../util/custom.json";
import * as d3 from "d3";
import ResizeObserver from "./UseResizeObserver";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./Center.css";
// Draw the map

function Center({ owi, countries, mapData, loc }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [value, setValue] = React.useState(0);
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = ResizeObserver(wrapperRef);

  const rotConfig = {
    speed: 0.01,
    verticalTilted: -10,
    horizontalTilted: 0,
  };

  //   console.log(mapData);
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    setWidth(width);
    setHeight(height);

    const projection = d3
      .geoMercator()
      .fitSize([width, height], selectedCountry || worldData)
      .precision(150);

    const pathGenerator = d3.geoPath().projection(projection);

    const minType = d3.min(countries, (d) => {
      if (value == 0) {
        return d.cases / d.population;
      }
      if (value == 1) {
        return d.deaths / d.population;
      }
    });
    const maxType = d3.max(countries, (d) => {
      if (value == 0) {
        return d.cases / d.population;
      }
      if (value == 1) {
        return d.deaths / d.population;
      }
    });

    const colorScale = d3
      .scaleLinear()
      .domain([minType, maxType])
      .range(["white", "tomato"]);

    function getCountryValue(iso) {
      const country = mapData.find((c) => c.iso_code == iso);

      if (country != undefined) {
        const another = countries.find((c) => c.country == country.location);

        if (another) return another.cases / another.population;
      }
    }

    // rotateMap();

    function rotateMap() {
      d3.timer((elapsed) => {
        projection.rotate([
          rotConfig.speed * elapsed - 120,
          rotConfig.verticalTilted,
          rotConfig.horizontalTilted,
        ]);
        svg.selectAll("path").attr("d", pathGenerator);
      });
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
      .duration(1000)
      .attr("fill", (d) => colorScale(getCountryValue(d.properties.iso_a3)))

      .attr("stroke", "black")
      .attr("d", (d) => pathGenerator(d));

    svg
      .selectAll(".label")
      .data([selectedCountry])
      .join("text")
      .attr("class", "label")
      .text((d) => d && d.properties.name)
      .attr("fill", "green")
      .attr("x", 20)
      .attr("y", 25);

    // svg.remove(".label");
  }, [owi, dimensions, mapData, countries, selectedCountry, loc, value]);

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div
      id="world"
      style={{
        marginBottom: "1rem",
        height: "100%",
      }}
      ref={wrapperRef}
    >
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            textColor="white"
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Cases" {...a11yProps(0)} />
            <Tab label="Deaths" {...a11yProps(1)} />
          </Tabs>
        </Box>
      </Box>
      <svg
        style={{
          width: width,
          height: height,
        }}
        ref={svgRef}
      ></svg>
    </div>
  );
}

export default Center;

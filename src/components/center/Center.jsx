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
import legend from "d3-svg-legend";
// Draw the map

function Center({ countries, loc, forClick }) {
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

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    let { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    width -= 100;
    height -= 100;

    setWidth(width);
    setHeight(height);

    const projection = d3
      // .geoOrthographic()
      .geoMercator()
      .fitSize([width, height], selectedCountry || worldData)
      .precision(150);

    const pathGenerator = d3.geoPath().projection(projection);

    let type;

    if (value == 0) type = "cases";
    if (value == 1) type = "deaths";
    if (value == 2) type = "dosesAdmin";
    if (value == 3) type = "insidentRate";
    if (value == 4) type = "caseFatalityRation";

    for (const l of countries) {
      l[type] = normalize(l[type], type);
      // console.log(l["cases"]);
    }

    console.log(countries);

    // let values = countries.map((d) => d.cases);

    function normalize(number, type) {
      // console.log(d3.max(countries, (d) => d.cases));
      const ratio = d3.max(countries, (d) => d[type]) / 100;

      return Math.round(number / ratio);
    }

    function denormalize(number, type) {
      const ratio = d3.max(countries, (d) => d[type]) / 100;
    }

    const minType = d3.min(countries, (d) => {
      if (value == 0) {
        return d.cases;
      }
      if (value == 1) {
        return d.deaths;
      }

      if (value == 2) {
        return d.dosesAdmin;
      }
      if (value == 3) {
        return d.insidentRate;
      }

      if (value == 4) {
        return d.caseFatalityRation;
      }
    });

    const maxType = d3.max(countries, (d) => {
      if (value == 0) {
        const val = d.cases;
        if (d.country == "US") {
          console.log(val + " for the us");
        }
        return val;
      }
      if (value == 1) {
        return d.deaths;
      }
      if (value == 2) {
        return d.dosesAdmin;
      }
      if (value == 3) {
        return d.insidentRate;
      }
      if (value == 4) {
        return d.caseFatalityRation;
      }
    });

    console.log(minType);
    console.log(maxType);

    const colorScale = d3
      // .scaleOrdinal()
      .scaleLinear()
      // .domain([0, 20], [21, 40], [41, 60], [61, 80], [81, 100])
      .domain(
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        // [
        //   [0, 10],
        //   [11, 20],
        //   [21, 30],
        //   [31, 40],
        //   [41, 50],
        //   [51, 60],
        //   [61, 70],
        //   [71, 80],
        //   [81, 90],
        //   [91, 100],
        // ]
      )
      .range([
        // "yellow",
        "rgb(110 64 170)",
        "rgb(200 61 172)",
        "rgb(246 83 118)",
        "rgb(247 140 56)",
        "rgb(201 211 59)",
        "rgb(121 246 89)",
        "rgb(73 234 141)",
        "rgb(60 184 208)",
        "rgb(71 117 222)",
        "rgb(110 64 170)",
      ]);
    // .range(["white", "yellow", "purple", "tomato", "blue"]);

    // const colorScale = d3
    //   .scaleLinear()
    //   .domain([minType, maxType])
    //   .range([minColor, maxColor]);

    function getCountryValue(iso) {
      const country = countries.find((c) => c.iso3 == iso);

      if (country != undefined) {
        // const another = countries.find((c) => c.country == country.location);
        if (value == 0) {
          if (country) return country.cases;
        }
        if (value == 1) {
          if (country) return country.deaths;
        }

        if (value == 2) {
          if (country) return country.dosesAdmin;
        }

        if (value == 3) {
          if (country) return country.insidentRate;
        }

        if (value == 4) {
          if (country) return country.caseFatalityRation;
        }
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

    // svg.selectAll('.infoContainer').data([selectedCountry]).join('div').attr('class', 'infoContainer').t

    svg
      .selectAll("myCircles")
      .data(countries)
      .enter()
      .append("circle")
      .attr("transform", (d) => `translate(${projection([d.long, d.lat])})`)
      .attr("r", 1)
      .style("fill", "69b3a2")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 3)
      .attr("fill-opacity", 0.4);

    svg
      .selectAll(".label")
      .data([selectedCountry])
      .join("text")
      .attr("class", "label")
      .text((d) => {
        // console.log(d && d.properties.iso_a3);

        if (d !== null) {
          const country = forClick.find((c) => c.iso3 == d.properties.iso_a3);
          console.log(country);
          // return country.deaths + " " + country.cases;
        }
      })
      .attr("fill", "green")
      .attr("x", 20)
      .attr("y", 25);
  }, [dimensions, countries, selectedCountry, loc, value]);

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

  // const legnd = d3.select('#world')

  var sequentialScale = d3
    .scaleSequential(d3.interpolateRainbow)
    .domain([0, 10]);

  var svg = d3.select("svg");

  svg
    .append("g")
    .attr("class", "legendSequential")
    .attr("transform", `translate(10, ${height - 20})`);

  var legendSequential = legend
    .legendColor()
    .shapeWidth(30)
    .cells(10)
    .orient("horizontal")
    .scale(sequentialScale);

  svg.select(".legendSequential").call(legendSequential);

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
            <Tab label="Vaccines" {...a11yProps(2)} />
            <Tab label="Insident Rate" {...a11yProps(3)} />
            <Tab label="Case/Fatality Ratio" {...a11yProps(4)} />
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

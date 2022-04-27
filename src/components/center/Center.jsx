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

function Center({ countries, loc, worldMap }) {
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
    let last = d3.selection.prototype.last = function() {   return d3.select(this.nodes()[this.size() - 1]); };
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
    let colorType = [];
    let f;

    let colorRange = [
      ["rgb(100, 75, 45)", "rgb(255, 75, 45)"],
      ["rgb(220,220,220)", "rgb(112, 128, 144)"],
      ["rgb(46, 73, 123)", "rgb(71, 187, 94)"],
      ["rgb(255,250,205)", "rgb(255,255,0)"],
      ["rgb(214,201,252)", "rgb(141,104,247)"],
    ];

    if (value == 0) {
      type = "cases";
      // setColorType(colorRange[0]);
      colorType = colorRange[0];
      f = d3.format(".2s");
    }
    if (value == 1) {
      type = "deaths";
      // setColorType(colorRange[1]);
      colorType = colorRange[1];
      f = d3.format(".2s");
    }
    if (value == 2) {
      type = "dosesAdmin";
      // setColorType(colorRange[2]);
      colorType = colorRange[2];
      f = d3.format(".2s");
    }
    if (value == 3) {
      type = "incidentRate";
      // setColorType(colorRange[3]);
      colorType = colorRange[3];
      f = d3.format(".2s");
    }
    if (value == 4) {
      type = "caseFatalityRatio";
      // setColorType(colorRange[4]);
      colorType = colorRange[4];
      f = d3.format("0.1f");
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
        return (d.cases / d.population) * 100000;  
      }

      if (value == 4) {
        return (d.deaths/d.cases) * 100;
      }
    });

    const maxType = d3.max(countries, (d) => {
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
        return (d.cases / d.population) * 100000;
      }
      if (value == 4) {
        return (d.deaths/d.cases) * 100;
      }
    });

    const colorScale = d3
      .scaleLinear()
      .domain([minType, maxType])
      .range(colorType);

    function getCountryValue(iso3) {
      const country = countries.find((c) => c.iso3 == iso3);

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
          if (country) return (country.cases / country.population) * 100000;
        }

        if (value == 4) {
          if (country)  return (country.deaths/country.cases) * 100;
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

    const di = (
      <div className="info">
        <h1>US</h1>
        <p>cases</p>
        <p>deaths</p>
      </div>
    );

    var tooltip = d3.select("body").append("div").attr("class", "tooltip");

    svg
      .selectAll(".country")
      .data(worldData.features)
      .join("path")
      .on("mouseover", (d) => {
        return tooltip.style("visibility", "visible").text("radius = " + d);
      })
      // .on("click", (feature, d) => {
      //   setSelectedCountry(selectedCountry === d ? null : d);
      // })

      .on("mousemove", (d) => {
        return tooltip
          .style("top", window.event.y - 50 + "px")
          .style("left", window.event.x + 30 + "px")
          .text(() => {
            return d.path[0].__data__.properties.name;
          });
      })

      .on("mouseout", function () {
        return tooltip.style("visibility", "hidden");
      })
      .attr("class", "country")
      .transition()
      .duration(1000)
      .attr("fill", (d) => colorScale(getCountryValue(d.properties.iso_a3)))

      .attr("stroke", "black")
      .attr("d", (d) => pathGenerator(d));

    // svg
    //   .selectAll("myCircles")
    //   .data(countries)
    //   .enter()
    //   .append("circle")
    //   .attr("transform", (d) => `translate(${projection([d.long, d.lat])})`)
    //   .attr("r", 1)
    //   .style("fill", "69b3a2")
    //   .attr("stroke", "#69b3a2")
    //   .attr("stroke-width", 3)
    //   .attr("fill-opacity", 0.4);

    svg
      .selectAll(".label")
      .data([selectedCountry])
      .join("text")
      .attr("class", "label")
      .text((d) => {
        // console.log(d && d.properties.iso_a3);

        if (d !== null) {
          const country = countries.find((c) => c.iso3 == d.properties.iso_a3);
          // console.log(country);
          return country.deaths + " " + country.cases;
        }
      })
      .attr("fill", "green")
      .attr("x", 20)
      .attr("y", 25);

    const linear = d3.scaleLinear().domain([0, 10]).range(colorType);

      const legendLinear = legend
      .legendColor()
      .shapeWidth(20)
      .cells(10)
      .orient("vertical")
      .scale(colorScale);

      svg
      .append("g")
      .attr("class", "legendLinear")
      .attr("transform", `translate(10,20)`)
      .call(legendLinear);

    //get legendCells
    const legendCells = svg.selectAll("g.legendCells").last();

    //get labels of legendCells
    const labels = legendCells.selectAll("text.label");

    //Iterate through each value and adjust formatting
    labels.each(function(d,i) {
      let label = d3.select(this);
      let t = label.text();

      if(parseFloat(t) <= 1){
        label.text("<= 1");
      }else{
      label.text(f(t).replace("G", "B"));
      }

    });

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
            <Tab label="Incident Rate" {...a11yProps(3)} />
            <Tab label="Fatality/Case Ratio" {...a11yProps(4)} />
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

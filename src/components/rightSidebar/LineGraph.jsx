import React, { useEffect } from "react";
import * as d3 from "d3";

function LineGraph({ jhuData, type, owi, loc }) {
  useEffect(() => {
    if (type == "cases" && jhuData.length > 0) {
      rollUpOwidLineGraph(jhuData, loc, type);
    }

    if (type == "deaths" && jhuData.length > 0) {
      rollUpOwidLineGraph(jhuData, loc, type);
    }

    if (type == "vaccines" && jhuData.length > 0) {
      rollUpOwidLineGraph(jhuData, loc, type);
    }
  }, []);

  //Uses OWID Data to form a region line graph for cases, deaths, and vaccinations
  function rollUpOwidLineGraph(dataType, location, type) {
    let format;

    if (type === "vaccines") {
      format = "Country_Region";
    } else {
      format = "Country/Region";
    }

    const data = dataType.filter((d) => d[format] === location);

    const all = Object.entries(data[0]);

    let color =
      type === "cases"
        ? "tomato"
        : type === "deaths"
        ? "white"
        : type === "recovered"
        ? "yellow"
        : "green";
    // data = unroll(data, ["date"], "value");

    linegraph(all, location, "%Y-%m-%d", color, type);
    // });
  }

  //Line Graph (Line can represent cases, deaths, vaccinations in a region over a specific period of time)
  //Modify this to change visualization of line graph
  function linegraph(data, location, dateformat, color, type) {
    // if (type === "cases" || type === "deaths") {
    for (const prop of data) {
      prop.date = new Date(prop.date);
    }
    // }

    let graphType;
    let titleText;

    if (type == "cases") {
      graphType = "#linegraph__" + type;
      titleText = "Infections";
    } else if (type == "deaths") {
      graphType = "#linegraph__" + type;
      titleText = "Deaths";
    } else {
      graphType = "#linegraph__" + type;
      titleText = "Vaccinations";
    }

    var div = d3.select(graphType);

    // let title = div
    //   .append("h2")
    //   .attr("width", "100px")
    //   .attr("display", "block")
    //   .attr("margin", "auto")
    //   .attr("stroke", "black")
    //   .text(titleText);

    const height = 500;
    const width = 500;
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 70,
    };

    if (type == "cases" || type == "deaths") {
      data.shift();
      data.shift();
      data.shift();
      data.shift();
    } else {
      for (let i = 0; i < 12; i++) {
        data.shift();
      }
    }

    const X = d3.map(data, (d) => {
      return new Date(d[0]);
    });

    const Y = d3.map(data, (d) => {
      if (d[1] === "") {
        return 0;
      } else {
        return parseInt(d[1]);
      }
    });

    const I = d3.range(X.length);

    var svg = div
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const xScale = d3
      .scaleUtc()
      .domain(d3.extent(X))
      .range([margin.left, width - margin.right]);
    const xAxis = d3.axisBottom(xScale).ticks(10).tickSizeOuter(0);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(Y)])
      .range([height - margin.bottom, margin.top]);

    const yAxis = d3.axisLeft(yScale).ticks(10).tickSizeOuter(0);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call((g) =>
        g
          .append("text")
          .attr("x", width - margin.right)
          .attr("y", margin.bottom)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("Date")
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      // .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - margin.left - margin.right)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", -margin.left)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(titleText)
      );

    const line = d3
      .line()
      .x((i) => xScale(X[i]))
      .y((i) => yScale(Y[i]));

    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("stroke-opacity", 1)
      .attr("d", line(I));
  }

  function unroll(rollup, keys, label = "value", p = {}) {
    return Array.from(rollup, ([key, value]) =>
      value instanceof Map
        ? unroll(
            value,
            keys.slice(1),
            label,
            Object.assign({}, { ...p, [keys[0]]: key })
          )
        : Object.assign({}, { ...p, [keys[0]]: key, [label]: value })
    ).flat();
  }
  return (
    <div style={{ marginBottom: "20px" }} id={`linegraph__${type}`}>
      {/* <div id="linegraph__cases"></div>
      <div id="linegraph__deaths"></div>
      <div id="linegraph__vaccines"></div> */}
    </div>
  );
}

export default LineGraph;

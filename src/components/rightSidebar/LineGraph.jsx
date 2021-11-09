import React, { useEffect } from "react";
import * as d3 from "d3";

function LineGraph({ type, owi, loc }) {
  useEffect(() => {
    const owid =
      "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";
    var jhu =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
    var jhuLookUp =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv";

    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);

    yesterdayDate.setDate(todayDate.getDate() - 1);

    const dd = String(todayDate.getDate()).padStart(2, "0");
    const mm = String(todayDate.getMonth() + 1).padStart(2, "0");
    const yyyy = todayDate.getFullYear();

    const ddY = String(yesterdayDate.getDate()).padStart(2, "0");
    const mmY = String(yesterdayDate.getMonth() + 1).padStart(2, "0");
    const yyyyY = yesterdayDate.getFullYear();

    const yesterdayJ = mmY + "-" + ddY + "-" + yyyyY;
    const yesterdayO = yyyyY + "-" + mmY + "-" + ddY;

    const todayO = yyyy + "-" + mm + "-" + dd;

    jhu += yesterdayJ + ".csv";
    let country = "United States";

    let location = "United Kingdom";

    // rollUpOwidTreeMapWorld(owid, yesterdayO, "c");
    // rollUpTreeMapCountry(owid, jhu, location, jhuLookUp, "c");
    if (owi.length > 0) {
      rollUpOwidLineGraph(owi, loc, todayO, type);
    }
  }, [owi]);

  //Uses OWID Data to form a region line graph for cases, deaths, and vaccinations
  function rollUpOwidLineGraph(owi, location, today, type) {
    // d3.csv(csv).then(function (data) {
    let data = owi
      .filter((d) => d.location === location)
      .filter((d) => d.date !== today);

    data = d3.rollup(
      data,
      (v) =>
        d3.sum(v, (d) =>
          type === "cases"
            ? d.total_cases
            : type === "deaths"
            ? d.total_deaths
            : d.people_vaccinated
        ),
      (d) => d.date
    );
    let color =
      type === "cases" ? "tomato" : type === "deaths" ? "white" : "green";
    data = unroll(data, ["date"], "value");

    linegraph(data, location, "%Y-%m-%d", color);
    // });
  }

  //Line Graph (Line can represent cases, deaths, vaccinations in a region over a specific period of time)
  //Modify this to change visualization of line graph
  function linegraph(data, location, dateformat, color) {
    for (const prop of data) {
      prop.date = new Date(prop.date);
    }

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

    const X = d3.map(data, (d) => d.date);
    const Y = d3.map(data, (d) => d.value);
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

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

    console.log(loc);
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
    let color = type === "cases" ? "red" : type === "deaths" ? "pink" : "green";
    data = unroll(data, ["date"], "value");

    linegraph(data, location, "%Y-%m-%d", color);
    // });
  }

  //Line Graph (Line can represent cases, deaths, vaccinations in a region over a specific period of time)
  //Modify this to change visualization of line graph
  function linegraph(data, location, dateformat, color) {
    let graphType;

    if (type == "cases") {
      graphType = "#linegraph__cases";
    } else if (type == "deaths") {
      graphType = "#linegraph__deaths";
    } else {
      graphType = "#linegraph__vaccines";
    }

    var div = d3.select(graphType);

    let title = div
      .append("h2")
      .attr("width", "100px")
      .attr("display", "block")
      .attr("margin", "auto")
      .attr("stroke", "black")
      .text(location);

    var svg = div.append("svg").attr("width", 500).attr("height", 400);
    const margin = 100,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;

    var parseDate = d3.timeParse(dateformat);

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    let valueline = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    var g = svg
      .append("g")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2)
      .attr("transform", `translate(${margin},${margin / 2})`);

    data.forEach(function (d) {
      d.date = parseDate(d.date);
      d.value = +d.value;
    });

    x.domain(d3.extent(data, (d) => d.date));
    y.domain([0, d3.max(data, (d) => d.value)]);

    const line = g
      .append("path")
      .data([data])
      .attr("stroke", color)
      .attr("fill", "none")
      .attr("stroke-width", "4px")
      .attr("d", valueline);

    var xaxis = g
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    var yaxis = g.append("g").call(d3.axisLeft(y));
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
  //   const svg = d3
  //     .select("#linegraph__cases")
  //     .append("svg")
  //     .attr("width", "1fr")
  //     .attr("height", 500);
  return (
    <div className="linegraph">
      <div id="linegraph__cases"></div>
      <div id="linegraph__deaths"></div>
      <div id="linegraph__vaccines"></div>
    </div>
  );
}

export default LineGraph;

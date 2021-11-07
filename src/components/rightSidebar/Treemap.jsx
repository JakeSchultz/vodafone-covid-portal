import React, { useEffect } from "react";
import * as d3 from "d3";
import "./Treemap.css";
import { filter, rollup } from "d3-array";

function Treemap({ loc }) {
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
    rollUpOwidTreeMapWorld(owid, yesterdayO, "c");
    rollUpOwidTreeMapWorld(owid, yesterdayO, "d");
    rollUpOwidTreeMapWorld(owid, yesterdayO, "v");
  }, [loc]);

  //Uses OWID Data to find iso code and then JHU Data to form world tree map for cases and deaths
  function rollUpTreeMapCountry(csv1, csv2, location, lookup, type) {
    let minColor, maxColor;
    d3.csv(csv1).then(function (data1) {
      let temp = data1.filter((d) => d.location === location);

      let isocode = temp[0].iso_code;

      d3.csv(lookup).then(function (data2) {
        data2 = data2.filter((d) => d.iso3 === isocode);

        let country = data2[0].Country_Region;

        data2 = d3.rollup(
          data2,
          (v) => d3.sum(v, (d) => d.Population),
          (d) => d.Province_State
        );
        data2 = unroll(data2, ["province"], "population");

        d3.csv(csv2).then(function (data3) {
          data3 = data3.filter((d) => d.Country_Region == country);

          data3 = d3.rollup(
            data3,
            (v) => d3.sum(v, (d) => (type === "c" ? d.Confirmed : d.Deaths)),
            (d) => d.Province_State
          );

          minColor = type === "c" ? "pink" : "lightgrey";
          maxColor = type === "c" ? "darkred" : "black";

          data3 = unroll(data3, ["name"], "value");

          let index = d3.index(data2, (d) => d.province);
          let data = data3.map(({ name, ...value }) => ({
            name,
            parent: location,
            population: index.get(name)?.population,
            ...value,
          }));
          data = data
            .filter((d) => d.population !== 0)
            .filter((d) => d.population !== undefined);

          let minValue = d3.min(data, (d) => (d.value / d.population) * 1000);
          let maxValue = d3.max(data, (d) => (d.value / d.population) * 1000);

          console.log(data);
          data = sortDescending(data);

          treemap(data, minValue, maxValue, minColor, maxColor, location);
        });
      });
    });
  }

  //Uses OWID Data to form world tree map for cases, deaths, and vaccinations
  function rollUpOwidTreeMapWorld(csv, yesterday, type) {
    let minColor, maxColor;
    d3.csv(csv).then(function (data) {
      data = data.filter((d) => d.date === yesterday);
      data = data.filter((d) => d.continent !== "");

      data = d3.rollup(
        data,
        (v) =>
          d3.sum(v, (d) =>
            type === "c"
              ? d.total_cases
              : type === "d"
              ? d.total_deaths
              : d.people_vaccinated
          ),
        (d) => d.location,
        (d) => d.population
      );

      minColor =
        type === "c" ? "pink" : type === "d" ? "lightgrey" : "lightgreen";
      maxColor =
        type === "c" ? "darkred" : type === "d" ? "black" : "darkgreen";

      data = unroll(data, ["name", "population"], "value");
      data = data.map(({ name, ...value }) => ({
        name,
        parent: "World",
        ...value,
      }));

      data = sortDescending(data);
      let minValue = d3.min(data, (d) => (d.value / d.population) * 1000);
      let maxValue = d3.max(data, (d) => (d.value / d.population) * 1000);

      treemap(data, minValue, maxValue, minColor, maxColor, "World");
    });
  }

  //Uses OWID Data to form continent tree map for cases, deaths, and vaccinations
  function rollUpOwidTreeMapContinent(csv, continent, yesterday, type) {
    let minColor, maxColor;
    d3.csv(csv).then(function (data) {
      data = data.filter((d) => d.date === yesterday);
      data = data.filter((d) => d.continent === continent);

      data = d3.rollup(
        data,
        (v) =>
          d3.sum(v, (d) =>
            type === "c"
              ? d.total_cases
              : type === "d"
              ? d.total_deaths
              : d.people_vaccinated
          ),
        (d) => d.location,
        (d) => d.population
      );

      minColor =
        type === "c" ? "pink" : type === "d" ? "lightgrey" : "lightgreen";
      maxColor =
        type === "c" ? "darkred" : type === "d" ? "black" : "darkgreen";

      data = unroll(data, ["name", "population"], "value");
      data = data.map(({ name, ...value }) => ({
        name,
        parent: continent,
        ...value,
      }));

      data = sortDescending(data);
      let minValue = d3.min(data, (d) => (d.value / d.population) * 1000);
      let maxValue = d3.max(data, (d) => (d.value / d.population) * 1000);

      treemap(data, minValue, maxValue, minColor, maxColor, continent);
    });
  }

  //Uses JHU Data to form world tree map for cases, deaths, and vaccinations
  function rollUpJhuTreeMapWorld(csv, lookup, type) {
    let minColor, maxColor;
    d3.csv(csv).then(function (data1) {
      data1 = d3.rollup(
        data1,
        (v) => d3.sum(v, (d) => (type === "c" ? d.Confirmed : d.Deaths)),
        (d) => d.Country_Region
      );

      minColor = type === "c" ? "pink" : "lightgrey";
      maxColor = type === "c" ? "darkred" : "black";

      data1 = unroll(data1, ["name"], "value");

      d3.csv(lookup).then(function (data2) {
        data2 = data2.filter((d) => d.Province_State === "");
        data2 = d3.rollup(
          data2,
          (v) => d3.sum(v, (d) => d.Population),
          (d) => d.Country_Region
        );

        data2 = unroll(data2, ["region"], "population");

        let index = d3.index(data2, (d) => d.region);

        let data = data1.map(({ name, parent, ...value }) => ({
          name,
          parent: "World",
          population: index.get(name)?.population,
          ...value,
        }));

        data = sortDescending(data);

        data = data
          .filter((d) => d.name !== "Summer Olympics 2020")
          .filter((d) => d.name !== "Diamond Princess")
          .filter((d) => d.name !== "MS Zaandam");

        let minValue = d3.min(data, (d) => (d.value / d.population) * 1000);
        let maxValue = d3.max(data, (d) => (d.value / d.population) * 1000);

        treemap(data, minValue, maxValue, minColor, maxColor, "World");
      });
    });
  }

  //Uses JHU Data to form country tree map for cases, deaths, and vaccinations
  function rollUpJhuTreeMapCountry(csv, lookup, country, type) {
    let minColor, maxColor;
    d3.csv(csv).then(function (data1) {
      data1 = data1.filter((d) => d.Country_Region == country);

      data1 = d3.rollup(
        data1,
        (v) => d3.sum(v, (d) => (type === "c" ? d.Confirmed : d.Deaths)),
        (d) => d.Province_State
      );

      minColor = type === "c" ? "pink" : "lightgrey";
      maxColor = type === "c" ? "darkred" : "black";

      data1 = unroll(data1, ["name"], "value");

      d3.csv(lookup).then(function (data2) {
        data2 = data2.filter((d) => d.Country_Region === country);
        data2 = d3.rollup(
          data2,
          (v) => d3.sum(v, (d) => d.Population),
          (d) => d.Province_State
        );

        data2 = unroll(data2, ["province"], "population");

        let index = d3.index(data2, (d) => d.province);

        let data = data1.map(({ name, ...value }) => ({
          name,
          parent: country,
          population: index.get(name)?.population,
          ...value,
        }));

        data = data
          .filter((d) => d.name !== "Grand Princess")
          .filter((d) => d.name !== "Diamond Princess")
          .filter((d) => d.name !== "Recovered");

        let minValue = d3.min(data, (d) => (d.value / d.population) * 1000);
        let maxValue = d3.max(data, (d) => (d.value / d.population) * 1000);

        console.log(minValue);
        console.log(maxValue);

        data = sortDescending(data);

        treemap(data, minValue, maxValue, minColor, maxColor, country);
      });
    });
  }

  //Uses OWID Data to form a region line graph for cases, deaths, and vaccinations
  function rollUpOwidLineGraph(csv, location, today, type) {
    d3.csv(csv).then(function (data) {
      data = data
        .filter((d) => d.location === location)
        .filter((d) => d.date !== today);

      data = d3.rollup(
        data,
        (v) =>
          d3.sum(v, (d) =>
            type === "c"
              ? d.total_cases
              : type === "d"
              ? d.total_deaths
              : d.people_vaccinated
          ),
        (d) => d.date
      );
      let color = type === "c" ? "red" : type === "d" ? "black" : "green";
      data = unroll(data, ["date"], "value");

      linegraph(data, location, "%Y-%m-%d", color);
    });
  }

  //Tree Map (Size can represent cases, deaths, vaccinations and color represents that value over the regions population)
  //Modify this to change visualization of line graph
  function treemap(data, minValue, maxValue, minColor, maxColor, r) {
    const margin = 5,
      width = 1000 - margin * 2,
      height = 400 - margin * 2;

    const div = d3.select(".graphic").select("#treeMap");

    let title = div.append("h2").text(r);

    const svg = div
      .append("svg")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2)
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`);

    let colorScale = d3
      .scaleLinear()
      .range([minColor, maxColor])
      .domain([minValue, maxValue]);

    data.unshift({ name: r, parent: null, population: null, value: null });

    let root = d3
      .stratify()
      .id((d) => d.name)
      .parentId((d) => d.parent)(data);

    root.sum((d) => +d.value);

    d3.treemap().size([width, height]).padding(4)(root);

    svg
      .selectAll("rect")
      .data(root.leaves())
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", (d) => colorScale((d.value / d.data.population) * 1000));

    svg
      .selectAll("text")
      .data(root.leaves())
      .join("text")
      .attr("x", (d) => d.x0 + 10)
      .attr("y", (d) => d.y0 + 20)
      .text(function (d) {
        let label = d.data.name;
        let size = label.length * 15;
        return size > d.x1 - d.x0 ? "" : d.data.name;
      })
      .attr("font-size", "15px")
      .attr("fill", "white");
  }

  //Line Graph (Line can represent cases, deaths, vaccinations in a region over a specific period of time)
  //Modify this to change visualization of line graph
  function linegraph(data, location, dateformat, color) {
    var div = d3.select(".graphic").select("#lineGraph");

    let title = div
      .append("h2")
      .attr("width", "100px")
      .attr("display", "block")
      .attr("margin", "auto")
      .attr("stroke", "black")
      .text(location);

    var svg = div.append("svg").attr("width", 1000).attr("height", 500);
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

  function sortDescending(data) {
    return data.sort((a, b) => -a.value - -b.value);
  }

  return (
    <div className="graphic">
      <div id="treeMap"></div>
      <div id="lineGraph"></div>
    </div>
  );
}

export default Treemap;

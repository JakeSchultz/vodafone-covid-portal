import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import Countries from "../leftSidebar/Countries";
import Graphs from "../../rightSidebar/Graphs";
import "./Dashboard.css";
import * as d3 from "d3";

function Dashboard() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState("Afghanistan");
  const [allData, setAllData] = useState([]);

  const owi =
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";

  let jhu =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";

  function generateDate(daysPast) {
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);

    yesterdayDate.setDate(todayDate.getDate() - daysPast);

    const dd = String(yesterdayDate.getDate()).padStart(2, "0");
    const mm = String(yesterdayDate.getMonth() + 1).padStart(2, "0");
    const yyyy = yesterdayDate.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
  }

  jhu += generateDate(1) + ".csv";

  useEffect(() => {
    d3.csv(owi).then((result) => {
      const filteredData = result
        .filter((d) => d.date === generateDate(1))
        .filter((d) => d.location != "");

      setAllData(result);

      const confirmed = d3.rollup(
        filteredData,
        (v) => d3.sum(v, (d) => d.total_cases),
        (d) => d.location
      );

      const deaths = d3.rollup(
        filteredData,
        (v) => d3.sum(v, (d) => d.total_deaths),
        (d) => d.location
      );

      const tempArr = [];

      for (const [k, v] of confirmed.entries()) {
        tempArr.push({ country: k, cases: v, deaths: deaths.get(k) });
      }

      setCountries(tempArr);
    });
  }, []);

  function handleClick(country) {
    setSelected(country);
  }

  return (
    <div id="dashboard">
      <div id="dashboard__header">
        <Header />
      </div>
      <div id="left">
        <Countries handleClick={handleClick} data={countries} />
      </div>
      <div id="center">
        <h1>center</h1>
      </div>
      <div id="right">
        <Graphs owi={allData} loc={selected} />
      </div>
    </div>
  );
}

export default Dashboard;

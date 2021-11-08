import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import Countries from "../leftSidebar/Countries";
import Graphs from "../rightSidebar/Graphs";
import Center from "../center/Center";
import "./Dashboard.css";
import * as d3 from "d3";

function Dashboard() {
  const [owiData, setOwiData] = useState([]);
  const [jhuData, setJhuData] = useState([]);

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

    return [yyyy + "-" + mm + "-" + dd, mm + "-" + dd + "-" + yyyy];
  }

  jhu += generateDate(1)[1] + ".csv";

  useEffect(() => {
    Promise.all([d3.csv(owi), d3.csv(jhu)]).then((loadData) => {
      const filteredData = loadData[0]
        .filter((d) => d.date == generateDate(1)[0])
        .filter((d) => d.location != "");

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

      setOwiData(loadData[0]);
      setJhuData(loadData[1]);
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
        <div id="left__info"></div>
        <Countries
          selected={selected}
          handleClick={handleClick}
          data={countries}
        />
      </div>
      <div id="center">
        <Center owi={owiData} countries={countries} />
      </div>
      <div id="right">
        <Graphs owi={owiData} jhu={jhuData} loc={selected} />
      </div>
    </div>
  );
}

export default Dashboard;

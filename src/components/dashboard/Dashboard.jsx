import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import Countries from "../leftSidebar/Countries";
import Graphs from "../rightSidebar/Graphs";
import Center from "../center/Center";
import "./Dashboard.css";
import * as d3 from "d3";
import jhuDailyReports from '../../data/jhu.csv';
import vaccineDailyReport from '../../data/vaccineDailyReport.csv';

function Dashboard() {
  const [jhuData, setjhuData] = useState({
    dailyReport: [],
    seriesConfirmed: [],
    seriesDeaths: [],
    seriesCases: [],
    seriesVaccines: [],
    seriesRecovered: [],
    seriesVaccineDoses: [],
    countries: [],
    UID_ISO_FIPS_LookUp_Table: [],
    worldMap: [],
  });

  const [selected, setSelected] = useState("Afghanistan");

  const owi =
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";

  // const jhuDailyReports = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${generateDate(
  //   1
  // )}.csv`;

  const jhuTSeriesConfirmed =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";

  const jhuTSeriesDeaths =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

  const jhuTSeriesRecovered =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";

  const uID_ISO_FIPS_LookUp_Table =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv";

  // const vaccineDailyReport =
  //   "https://raw.githubusercontent.com/govex/COVID-19/master/data_tables/vaccine_data/global_data/vaccine_data_global.csv";

  const vaccineTSeries =
    "https://raw.githubusercontent.com/govex/COVID-19/master/data_tables/vaccine_data/global_data/time_series_covid19_vaccine_global.csv";

  const vaccineDosesTSeries =
    "https://raw.githubusercontent.com/govex/COVID-19/master/data_tables/vaccine_data/global_data/time_series_covid19_vaccine_doses_admin_global.csv";

  function generateDate(daysPast) {
    const todayDate = new Date();

    const yesterdayDate = new Date(todayDate);

    yesterdayDate.setDate(todayDate.getDate() - daysPast);

    const dd = String(yesterdayDate.getDate()).padStart(2, "0");
    const mm = String(yesterdayDate.getMonth() + 1).padStart(2, "0");
    const yyyy = yesterdayDate.getFullYear();

    return mm + "-" + dd + "-" + yyyy;
  }

  useEffect(() => {
    Promise.all([
      d3.csv(owi),
      d3.csv(jhuDailyReports),
      d3.csv(jhuTSeriesConfirmed),
      d3.csv(jhuTSeriesDeaths),
      d3.csv(jhuTSeriesRecovered),
      d3.csv(uID_ISO_FIPS_LookUp_Table),
      d3.csv(vaccineDailyReport),
      d3.csv(vaccineTSeries),
      d3.csv(vaccineDosesTSeries),
    ]).then((loadData) => {
      const jhuCases = d3.rollup(
        loadData[1],
        (v) => d3.sum(v, (d) => d.Confirmed),
        (d) => d.Country_Region
      );

      const jhuDeaths = d3.rollup(
        loadData[1],
        (v) => d3.sum(v, (d) => d.Deaths),
        (d) => d.Country_Region
      );

      const jhuRecovered = d3.rollup(
        loadData[1],
        (v) => d3.sum(v, (d) => d.Recovered), //changed this from recoved to recovered
        (d) => d.Country_Region
      );

      const jhuInsidentRate = d3.rollup(
        loadData[1],
        (v) => d3.sum(v, (d) => d.Incident_Rate),
        (d) => d.Country_Region
      );

      const jhuCaseFatalityRation = d3.rollup(
        loadData[1],
        (v) => d3.sum(v, (d) => d.Case_Fatality_Ratio),
        (d) => d.Country_Region
      );

      const jhuDosesAdministered = d3.rollup(
        loadData[6],
        (v) => d3.sum(v, (d) => d.Doses_admin),
        (d) => d.Country_Region
      );

      const jhuPartiallyVaccinated = d3.rollup(
        loadData[6],
        (v) => d3.sum(v, (d) => d.People_partially_vaccinated),
        (d) => d.Country_Region
      );

      const jhuFullyVaccinated = d3.rollup(
        loadData[6],
        (v) => d3.sum(v, (d) => d.People_fully_vaccinated),
        (d) => d.Country_Region
      );

      const tempArr = [];

      for (const [k, v] of jhuCases.entries()) {
        tempArr.push({
          country: k,
          cases: v,
          deaths: jhuDeaths.get(k),
          recovered: jhuRecovered.get(k),
          // Incident_Rate: Incidence Rate = cases per 100,000 persons.
          insidentRate: jhuInsidentRate.get(k),
          // Case_Fatality_Ratio (%): Case-Fatality Ratio (%) = Number recorded deaths / Number cases.
          caseFatalityRation: jhuCaseFatalityRation.get(k),
          dosesAdmin: jhuDosesAdministered.get(k),
          partiallyVacc: jhuPartiallyVaccinated.get(k),
          fullyVacc: jhuFullyVaccinated.get(k),
          population: parseInt(
            loadData[5].find((d) => d.Country_Region === k).Population
          ),
          iso3: loadData[5].find((d) => d.Country_Region === k).iso3,
          long: loadData[5].find((d) => d.Country_Region === k).Long_,
          lat: loadData[5].find((d) => d.Country_Region === k).Lat,
        });
      }

      // setMapData(filteredData);

      setjhuData({
        dailyReport: loadData[1],
        seriesConfirmed: loadData[2],
        seriesDeaths: loadData[3],
        seriesRecovered: loadData[4],
        countries: tempArr,
        seriesVaccines: loadData[7],
        seriesVaccineDoses: loadData[8],
        UID_ISO_FIPS_LookUp_Table: loadData[5],
        worldMap: loadData[9],
      });
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
          data={jhuData.countries}
        />
      </div>
      <div id="center">
        <Center
          loc={selected}
          countries={jhuData.countries}
          worldMap={jhuData.worldMap}
        // mapData={mapData}
        />
      </div>
      <div id="right">
        <Graphs jhuData={jhuData} loc={selected} />
      </div>
    </div>
  );
}

export default Dashboard;

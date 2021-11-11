import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import Countries from "../leftSidebar/Countries";
import Graphs from "../rightSidebar/Graphs";
import Center from "../center/Center";
import "./Dashboard.css";
import * as d3 from "d3";

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
  });

  // const [jhuCasesDailiyReport, setJhuCasesDailiyReport] = useState([]);

  // const [jhuSeriesConfirmed, setJhuSeriesConfirmed] = useState([]);
  // const [jhuSeriesDeaths, setJhuSeriesDeaths] = useState([]);
  // const [jhuSeriesRecovered, setJhuSeriesRecovered] = useState([]);

  // const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState("Afghanistan");
  // const [mapData, setMapData] = useState([]);

  const owi =
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";

  let jhu =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";

  const jhuDailyReports =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/11-07-2021.csv";

  const jhuTSeriesConfirmed =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";

  const jhuTSeriesDeaths =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

  const jhuTSeriesRecovered =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";

  const uID_ISO_FIPS_LookUp_Table =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv";

  const vaccineDailyReport =
    "https://raw.githubusercontent.com/govex/COVID-19/master/data_tables/vaccine_data/global_data/vaccine_data_global.csv";

  const vaccineTSeires =
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

    return [yyyy + "-" + mm + "-" + dd, mm + "-" + dd + "-" + yyyy];
  }

  jhu += generateDate(1)[1] + ".csv";

  useEffect(() => {
    Promise.all([
      d3.csv(owi),
      d3.csv(jhuDailyReports),
      d3.csv(jhuTSeriesConfirmed),
      d3.csv(jhuTSeriesDeaths),
      d3.csv(jhuTSeriesRecovered),
      d3.csv(uID_ISO_FIPS_LookUp_Table),
      d3.csv(vaccineDailyReport),
      d3.csv(vaccineTSeires),
      d3.csv(vaccineDosesTSeries),
    ]).then((loadData) => {
      // const filteredData = loadData[0]
      //   .filter((d) => d.date == generateDate(1)[0])
      //   .filter((d) => d.location != "")
      //   .filter((d) => d.location != "World")
      //   .filter((d) => d.location != "Asia")
      //   .filter((d) => d.location != "Africa")
      //   .filter((d) => d.location != "South America")
      //   .filter((d) => d.location != "North America")
      //   .filter((d) => d.location != "Europe")
      //   .filter((d) => d.location != "European Union")
      //   .filter((d) => d.location != "Oceania")
      //   .filter((d) => d.location != "Low income")
      //   .filter((d) => d.location != "Lower middle income")
      //   .filter((d) => d.location != "Upper middle income")
      //   .filter((d) => d.location != "High income")
      //   .filter((d) => d.population != 0);

      var dt = new Date();

      // dt.getMonth() will return a month between 0 - 11
      // we add one to get to the last day of the month
      // so that when getDate() is called it will return the last day of the month
      var month = dt.getMonth() + 1;
      var year = dt.getFullYear();

      // this line does the magic (in collab with the lines above)
      var daysInMonth = new Date(year, month, 0).getDate();

      // console.log(daysInMonth);

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
        (v) => d3.sum(v, (d) => d.Recoved),
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
      });

      // setJhuCasesDailiyReport(loadData[1]);
      // setJhuSeriesConfirmed(loadData[2]);
      // setJhuSeriesDeaths(loadData[3]);
      // setJhuSeriesRecovered(loadData[4]);

      // setCountries(tempArr);
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

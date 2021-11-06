import React, { useEffect, useState } from "react";
import "./Country.css";

function Country({ country, handleClick }) {
  const [selected, setSelected] = useState(false);

  function handleClickCountry() {
    setSelected(selected === false ? true : false);
    // console.log("you clicked me");
    handleClick(country.country);
  }

  return (
    <div
      className={`country ${selected === true ? "cSelected" : ""}`}
      onClick={handleClickCountry}
    >
      <div className="country__content">
        <h1>{country.country}</h1>
        <div className="country__statistics">
          <p className="country__statistics-cases">
            Cases: {country.cases.toLocaleString("en-US")}
          </p>
          <p>|</p>
          <p>Deaths: {country.deaths.toLocaleString("en-US")}</p>
        </div>
      </div>
    </div>
  );
}

export default Country;

import React, { useState, useEffect } from "react";
import Country from "./Country";
import * as d3 from "d3";

function Countries({ data, handleClick }) {
  return (
    <div id="countries">
      {data.map((c) => {
        return (
          <Country handleClick={handleClick} key={c.country} country={c} />
        );
      })}
    </div>
  );
}

export default Countries;

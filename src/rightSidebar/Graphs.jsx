import React, { useEffect } from "react";
import LineGraph from "./LineGraph";

function Graphs({ owi, loc }) {
  // console.log(owi);

  return (
    <div>
      <LineGraph type="cases" owi={owi} loc={loc} />
      <LineGraph type="deaths" owi={owi} loc={loc} />
      <LineGraph type="vaccines" owi={owi} loc={loc} />
    </div>
  );
}

export default Graphs;

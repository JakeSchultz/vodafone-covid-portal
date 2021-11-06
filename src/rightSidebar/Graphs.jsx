import React, { useEffect } from "react";
import LineGraph from "./LineGraph";
import { v4 as uuidv4 } from "uuid";

function Graphs({ owi, loc }) {
  // console.log(owi);

  return (
    <div>
      <LineGraph key={uuidv4()} type="cases" owi={owi} loc={loc} />
      <LineGraph key={uuidv4()} type="deaths" owi={owi} loc={loc} />
      <LineGraph key={uuidv4()} type="vaccines" owi={owi} loc={loc} />
    </div>
  );
}

export default Graphs;

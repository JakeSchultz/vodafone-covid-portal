import react, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/header/Header";
import * as d3 from "d3";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <div id="App">
      <Dashboard />
    </div>
  );
}

export default App;

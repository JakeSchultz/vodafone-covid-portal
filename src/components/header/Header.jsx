import React from "react";
import "./Header.css";
import virusIcon from "../../assets/virus.png";

function Header() {
  return (
    <div id="header">
      <div id="header__title">
        <img src={virusIcon} />
        <h1 className="text-shadow">COVID-19 Portal</h1>
      </div>
      {/* <nav id="nav">
        <ul id="header__items">
          <li className="header__item">
            <a className="text-shadow" href="#">
              Visualizations
            </a>
          </li>
          <li className="header__item">
            <a className="text-shadow" href="#">
              About
            </a>
          </li>
        </ul>
      </nav> */}
    </div>
  );
}

export default Header;

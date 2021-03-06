import React from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "antd";

import "./Navigation.scss";

export const Navigation: React.FC = () => {
  return (
    <div className="Navigation">
      <div className="home-tab">
        <NavLink className="tab " to="/" exact>
          <Icon className="navlink-icon" type="home" />
          <p>Home</p>
        </NavLink>
      </div>
      <div className="search-tab">
        <NavLink className="tab" to="/search">
          <Icon className="navlink-icon" type="search" />
          <p>Search</p>
        </NavLink>
      </div>
      <div className="collection-tab">
        <NavLink className="tab" to="/collection">
          <Icon className="navlink-icon" type="align-right" rotate={90} />
          <p>Your Library</p>
        </NavLink>
      </div>
    </div>
  );
};

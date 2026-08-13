import React from "react";
import { IonRouterOutlet, IonSplitPane } from "@ionic/react";
import { Route } from "react-router-dom";

import Menu from "./Menu";
import DashboardPage from "../pages/DashboardPage";
import Log from "../pages/log";
import Assets from "../pages/Assets";
import Page from "../pages/Page";

const AppLayout: React.FC = () => {
  return (
    <IonSplitPane contentId="main">

      <Menu />

      <IonRouterOutlet id="main">

        <Route
          exact
          path="/dashboard"
          component={DashboardPage}
        />

        <Route
          exact
          path="/logs"
          component={Log}
        />

        <Route
          exact
          path="/assets"
          component={Assets}
        />

        <Route
          exact
          path="/page"
          component={Page}
        />

      </IonRouterOutlet>

    </IonSplitPane>
  );
};

export default AppLayout;
import React from "react";

import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";

import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";
import DashboardPage from "./pages/DashboardPage";

setupIonicReact();

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>

          <IonRouterOutlet>

            {/* Root URL */}
            <Route
              exact
              path="/"
              render={() => <Redirect to="/login" />}
            />

            {/* Public pages */}
            <Route
              exact
              path="/login"
              component={Login}
            />

            <Route
              exact
              path="/register"
              component={Register}
            />

            {/* Protected application */}
            <ProtectedRoute
              path="/dashboard"
              component={DashboardPage}
            />

          </IonRouterOutlet>

        </IonReactRouter>
      </IonApp>
    </QueryClientProvider>
  );
};

export default App;
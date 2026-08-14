import React from "react";

import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";

import { IonReactRouter } from "@ionic/react-router";
import {
  Redirect,
  Route,
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import Log from "./pages/log";
import Assets from "./pages/Assets";
import Page from "./pages/Page";

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


setupIonicReact();


const queryClient = new QueryClient();


const App: React.FC = () => {

  return (
    <QueryClientProvider client={queryClient}>

      <IonApp>

        <IonReactRouter>

          <IonRouterOutlet>


            {/* =========================
                PUBLIC ROUTES
            ========================== */}

            <Route
              exact
              path="/"
              render={() => (
                <Redirect to="/login" />
              )}
            />


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


            {/* =========================
                PROTECTED APPLICATION
            ========================== */}

            <ProtectedRoute
              path="/dashboard"
              component={() => (
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              )}
            />


            <ProtectedRoute
              path="/logs"
              component={() => (
                <AppLayout>
                  <Log />
                </AppLayout>
              )}
            />


            <ProtectedRoute
              path="/assets"
              component={() => (
                <AppLayout>
                  <Assets />
                </AppLayout>
              )}
            />


            <ProtectedRoute
              path="/page"
              component={() => (
                <AppLayout>
                  <Page />
                </AppLayout>
              )}
            />


          </IonRouterOutlet>

        </IonReactRouter>

      </IonApp>

    </QueryClientProvider>
  );
};


export default App;
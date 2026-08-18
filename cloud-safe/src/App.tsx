import React from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
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
import Menu from "./components/Menu";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import Log from "./pages/log";
import Assets from "./pages/Assets";
import Account from "./pages/Account";

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

const queryClient=new QueryClient();

const App:React.FC=()=>(
  <QueryClientProvider client={queryClient}>
    <IonApp>
      <IonReactRouter>

        <Route exact path="/login" component={Login}/>
        <Route exact path="/register" component={Register}/>

        <Route
          path="/"
          render={({location})=>{

            if(
              location.pathname==="/login" ||
              location.pathname==="/register"
            ){
              return null;
            }

            return(
              <>
                <Menu/>

                <IonRouterOutlet id="main">

                  <ProtectedRoute
                    exact
                    path="/dashboard"
                    component={DashboardPage}
                  />

                  <ProtectedRoute
                    exact
                    path="/logs"
                    component={Log}
                  />

                  <ProtectedRoute
                    exact
                    path="/assets"
                    component={Assets}
                  />

                  <ProtectedRoute
                    exact
                    path="/Account"
                    component={Account}
                  />

                  <Route
                    exact
                    path="/"
                    render={()=>(
                      <Redirect to="/dashboard"/>
                    )}
                  />


                </IonRouterOutlet>
              </>
            );
          }}
        />

      </IonReactRouter>
    </IonApp>
  </QueryClientProvider>
);

export default App;
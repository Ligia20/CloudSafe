import React from "react";

import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/react";

import {
  home,
  list,
  server,
  document,
  logOut,
} from "ionicons/icons";

import { useHistory } from "react-router-dom";

const Menu: React.FC = () => {
  const history = useHistory();

  const handleLogout = async () => {
    console.log("LOGOUT CLICKED");

    try {
      // Tell backend to destroy the session/cookie
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      console.log(
        "LOGOUT RESPONSE:",
        response.status
      );

      if (!response.ok) {
        console.error(
          "Backend logout failed:",
          response.status
        );
      }

    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

    } finally {

      // Always clear frontend authentication
      localStorage.removeItem("authenticated");

      console.log(
        "AUTH AFTER LOGOUT:",
        localStorage.getItem("authenticated")
      );

      // Return to login
      history.replace("/login");
    }
  };

  return (
    <IonMenu contentId="main">

      <IonHeader>
        <IonToolbar>
          <IonTitle>
            CloudSafe
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>

        <IonList>

          {/* Dashboard */}

          <IonItem
            button
            routerLink="/dashboard"
          >
            <IonIcon
              icon={home}
              slot="start"
            />

            <IonLabel>
              Dashboard
            </IonLabel>
          </IonItem>


          {/* Logs */}

          <IonItem
            button
            routerLink="/logs"
          >
            <IonIcon
              icon={list}
              slot="start"
            />

            <IonLabel>
              Logs
            </IonLabel>
          </IonItem>


          {/* Assets */}

          <IonItem
            button
            routerLink="/assets"
          >
            <IonIcon
              icon={server}
              slot="start"
            />

            <IonLabel>
              Assets
            </IonLabel>
          </IonItem>


          {/* Page */}

          <IonItem
            button
            routerLink="/page"
          >
            <IonIcon
              icon={document}
              slot="start"
            />

            <IonLabel>
              Page
            </IonLabel>
          </IonItem>


          {/* Logout */}

          <IonItem
            button
            onClick={handleLogout}
          >
            <IonIcon
              icon={logOut}
              slot="start"
            />

            <IonLabel>
              Logout
            </IonLabel>
          </IonItem>

        </IonList>

      </IonContent>

    </IonMenu>
  );
};

export default Menu;
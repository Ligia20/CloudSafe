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
import { home, list, server, document, logOut } from "ionicons/icons";
import { menuController } from "@ionic/core";
import { useHistory } from "react-router-dom";

const Menu: React.FC = () => {
  const history = useHistory();

  const handleNavigation = async (path: string) => {
    history.push(path);
    await menuController.close();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Backend logout failed:", response.status);
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      localStorage.removeItem("authenticated");
      localStorage.removeItem("token");
      await menuController.close();
      history.replace("/login");
    }
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>CloudSafe</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList lines="none">
          <IonItem button onClick={() => handleNavigation("/dashboard")}>
            <IonIcon icon={home} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          <IonItem button onClick={() => handleNavigation("/logs")}>
            <IonIcon icon={list} slot="start" />
            <IonLabel>Log</IonLabel>
          </IonItem>

          <IonItem button onClick={() => handleNavigation("/assets")}>
            <IonIcon icon={server} slot="start" />
            <IonLabel>Assets</IonLabel>
          </IonItem>

          <IonItem button onClick={() => handleNavigation("/Account")}>
            <IonIcon icon={document} slot="start" />
            <IonLabel>Account</IonLabel>
          </IonItem>

          <IonItem button onClick={handleLogout}>
            <IonIcon icon={logOut} slot="start" />
            <IonLabel>Logout</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
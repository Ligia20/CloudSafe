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
      <IonHeader className="theme-header">
        <IonToolbar>
          <IonTitle className="theme-menu-btn">CloudSafe</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="theme-header">
        <IonList lines="none"  className="theme-header">
          <IonItem  className="theme-header" button onClick={() => handleNavigation("/dashboard")}>
            <IonIcon className="theme-menu-btn" icon={home} slot="start" />
            <IonLabel style={{ color: '#b9d6f2' }}> Dashboard</IonLabel>
          </IonItem>

          <IonItem  className="theme-header" button onClick={() => handleNavigation("/logs")}>
            <IonIcon className="theme-menu-btn" icon={list} slot="start" />
            <IonLabel style={{ color: '#b9d6f2' }}>Logs</IonLabel>
          </IonItem>

          <IonItem  className="theme-header" button onClick={() => handleNavigation("/assets")}>
            <IonIcon className="theme-menu-btn" icon={server} slot="start" />
            <IonLabel style={{ color: '#b9d6f2' }}>Cloud Assets</IonLabel>
          </IonItem>

          <IonItem  className="theme-header" button onClick={() => handleNavigation("/Account")}>
            <IonIcon className="theme-menu-btn" icon={document} slot="start" />
            <IonLabel style={{ color: '#b9d6f2' }}>Account</IonLabel>
          </IonItem>

          <IonItem  className="theme-header" button onClick={handleLogout}>
            <IonIcon className="theme-menu-btn" icon={logOut} slot="start" />
            <IonLabel style={{ color: '#b9d6f2' }}>Logout</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
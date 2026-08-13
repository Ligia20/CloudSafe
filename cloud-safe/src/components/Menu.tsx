import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonButton,
} from "@ionic/react";

import {
  archiveOutline,
  archiveSharp,
  bookmarkOutline,
  heartOutline,
  heartSharp,
  mailOutline,
  mailSharp,
  paperPlaneOutline,
  paperPlaneSharp,
  trashOutline,
  trashSharp,
  warningOutline,
  warningSharp,
  logOutOutline,
} from "ionicons/icons";

import { useLocation, useHistory } from "react-router-dom";

import "./Menu.css";

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    iosIcon: mailOutline,
    mdIcon: mailSharp,
  },
  {
    title: "Assets",
    url: "/assets",
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp,
  },
  {
    title: "Log",
    url: "/logs",
    iosIcon: heartOutline,
    mdIcon: heartSharp,
  },
];

const API_URL = import.meta.env.VITE_API_URL;

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Logout failed");
        return;
      }

      // Remove frontend authentication state
      localStorage.removeItem("authenticated");
      // Send user back to login
      history.push("/login");

    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  return (
    <IonMenu contentId="main">

      <IonContent>

        <IonList id="inbox-list">

          <IonListHeader>
            Cloud Safe
          </IonListHeader>

          <IonNote>
            hi@ionicframework.com
          </IonNote>

          {appPages.map((appPage, index) => (
            <IonMenuToggle key={appPage.title} autoHide={false}>

              <IonItem
                className={
                  location.pathname === appPage.url
                    ? "selected"
                    : ""
                }
                routerLink={appPage.url}
                routerDirection="none"
                lines="none"
                detail={false}
              >
                <IonIcon
                  slot="start"
                  ios={appPage.iosIcon}
                  md={appPage.mdIcon}
                />

                <IonLabel>
                  {appPage.title}
                </IonLabel>
              </IonItem>

            </IonMenuToggle>
          ))}

        </IonList>

        {/* Logout */}
        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem
              button
              lines="none"
              onClick={handleLogout}
            >
              <IonIcon
                slot="start"
                icon={logOutOutline}
              />

              <IonLabel>
                Logout
              </IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>

      </IonContent>

    </IonMenu>
  );
};

export default Menu;
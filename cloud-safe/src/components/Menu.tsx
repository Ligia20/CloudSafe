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

const Menu:React.FC=()=>{
  const history=useHistory();

  const handleNavigation=(path:string)=>{
    history.push(path);
  };

  const handleLogout=async()=>{
    console.log("LOGOUT CLICKED");

    try{
      const response=await fetch("/api/logout",{
        method:"POST",
        credentials:"include",
      });

      console.log("LOGOUT RESPONSE:",response.status);

      if(!response.ok){
        console.error(
          "Backend logout failed:",
          response.status
        );
      }
    }catch(error){
      console.error(
        "LOGOUT ERROR:",
        error
      );
    }finally{
      localStorage.removeItem("authenticated");
      localStorage.removeItem("token");

      console.log(
        "AUTH AFTER LOGOUT:",
        localStorage.getItem("authenticated")
      );

      history.replace("/login");
    }
  };

  return(
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

          <IonItem
            button
            onClick={()=>handleNavigation("/dashboard")}
          >
            <IonIcon
              icon={home}
              slot="start"
            />

            <IonLabel>
              Dashboard
            </IonLabel>
          </IonItem>

          <IonItem
            button
            onClick={()=>handleNavigation("/logs")}
          >
            <IonIcon
              icon={list}
              slot="start"
            />

            <IonLabel>
              Logs
            </IonLabel>
          </IonItem>

          <IonItem
            button
            onClick={()=>handleNavigation("/assets")}
          >
            <IonIcon
              icon={server}
              slot="start"
            />

            <IonLabel>
              Assets
            </IonLabel>
          </IonItem>

          <IonItem
            button
            onClick={()=>handleNavigation("/page")}
          >
            <IonIcon
              icon={document}
              slot="start"
            />

            <IonLabel>
              Page
            </IonLabel>
          </IonItem>

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
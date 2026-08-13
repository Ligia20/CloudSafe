import React from "react";

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import ExploreContainer from "../components/ExploreContainer";

import "./Page.css";


const Page: React.FC = () => {

  const name = "Page";

  return (
    <IonPage>

      <IonHeader>

        <IonToolbar>

          <IonTitle>
            {name}
          </IonTitle>

        </IonToolbar>

      </IonHeader>


      <IonContent fullscreen>

        <IonHeader collapse="condense">

          <IonToolbar>

            <IonTitle size="large">
              {name}
            </IonTitle>

          </IonToolbar>

        </IonHeader>


        <ExploreContainer
          name={name}
        />

      </IonContent>

    </IonPage>
  );
};


export default Page;
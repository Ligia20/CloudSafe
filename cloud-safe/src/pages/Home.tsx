import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from "@ionic/react";

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CloudSafe</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1>Welcome to CloudSafe</h1>

        <p>Please login or register to continue.</p>

        <IonButton routerLink="/login" expand="block">
          Login
        </IonButton>

        <IonButton
          routerLink="/register"
          expand="block"
          fill="outline"
        >
          Register
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
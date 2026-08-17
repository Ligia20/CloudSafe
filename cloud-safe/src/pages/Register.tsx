import React, { useState } from "react";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  IonText,
} from "@ionic/react";

import { useHistory } from "react-router-dom";

const API_URL = "/api";

const Register: React.FC = () => {

  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setError("");

    try {

      const response = await fetch(
        `${API_URL}/v1/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Registration failed"
        );

        return;
      }

      console.log(
        "Registration successful"
      );

      /*
       * Registration does not automatically
       * authenticate the user.
       *
       * Send them to login.
       */
      history.replace("/login");

    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    }
  };

  return (
    <IonPage>

      <IonHeader>

        <IonToolbar>

          <IonTitle>
            Create Account
          </IonTitle>

        </IonToolbar>

      </IonHeader>

      <IonContent className="ion-padding">

        <form onSubmit={handleRegister}>

          <IonItem>

            <IonInput
              label="Username"
              labelPlacement="floating"
              value={username}
              onIonInput={(e) =>
                setUsername(
                  e.detail.value ?? ""
                )
              }
            />

          </IonItem>

          <IonItem>

            <IonInput
              type="password"
              label="Password"
              labelPlacement="floating"
              value={password}
              onIonInput={(e) =>
                setPassword(
                  e.detail.value ?? ""
                )
              }
            />

          </IonItem>

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          <IonButton
            expand="block"
            type="submit"
          >
            Register
          </IonButton>

        </form>

        <IonButton
          fill="clear"
          expand="block"
          onClick={() =>
            history.push("/login")
          }
        >
          Already have an account? Login
        </IonButton>

      </IonContent>

    </IonPage>
  );
};

export default Register;
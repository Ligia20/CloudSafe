import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
} from "@ionic/react";

const API_URL = "/api";

const Login: React.FC = () => {
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // Basic validation
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      // Incorrect username/password
      if (response.status === 401) {
        setError("Username and/or password is not correct");
        return;
      }

      // Other backend errors
      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Login successful
      localStorage.setItem("authenticated", "true");

      // Redirect to dashboard
      history.push("/dashboard");

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Unable to connect to server");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CloudSafe Login</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonInput
            label="Username"
            value={username}
            onIonInput={(e) =>
              setUsername(e.detail.value ?? "")
            }
          />
        </IonItem>

        <IonItem>
          <IonInput
            label="Password"
            type="password"
            value={password}
            onIonInput={(e) =>
              setPassword(e.detail.value ?? "")
            }
          />
        </IonItem>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <IonButton
          expand="block"
          onClick={handleLogin}
        >
          Login
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          onClick={() => history.push("/register")}
        >
          Don't have an account? Register
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default Login;
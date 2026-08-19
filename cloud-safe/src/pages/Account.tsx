import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonButton,
  IonButtons,
  IonMenuButton,
  useIonViewWillEnter
} from "@ionic/react";


import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import "./Account.css";

const API_URL = "/api";

//Used AI to help with cleaner css and visualization 

const getToken = () => {
  return localStorage.getItem("token");
};

const handleUnauthorized = () => {
  localStorage.removeItem("authenticated");
  localStorage.removeItem("token");

  window.location.href = "/login";
};


const authHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};

const Account = () => {
    const queryClient = useQueryClient();
    
    const contentRef =
        React.useRef<HTMLIonContentElement>(null);
    
        useIonViewWillEnter(() => {
        setTimeout(() => {
            contentRef.current?.scrollToTop(0);
        }, 0);
      });

      
    
      // =======================================================
      // CLEAR RECORDS
      // =======================================================
    
      const clearMutation = useMutation({
        mutationFn: async () => {
          const response = await fetch(`${API_URL}/v1/clear`, {
            method: "DELETE",
            headers: authHeaders()
          });
    
          if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Session expired");
          }
    
          if (!response.ok) {
            const errorData =
              await response.json().catch(() => null);
    
            throw new Error(
              errorData?.error ||
                "Failed to clear old records"
            );
          }
    
          return response.json();
        },
    
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["securityDashboardData"]
          });

          queryClient.invalidateQueries({
            queryKey: ["dashboardEvents"]
          });

          queryClient.invalidateQueries({
            queryKey: ["dashboardAlerts"]
          });

          queryClient.invalidateQueries({
            queryKey: ["dashboardRecent"]
          });

          window.location.href = "/dashboard";
        }
      });
    
      // =======================================================
      // DELETE USER
      // =======================================================
    
      const deleteUserMutation = useMutation({
        mutationFn: async () => {
          const response = await fetch(
            `${API_URL}/v1/account`,
            {
              method: "DELETE",
              headers: authHeaders()
            }
          );
    
          if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Session expired");
          }
    
          if (!response.ok) {
            const errorData =
              await response.json().catch(() => null);
    
            throw new Error(
              errorData?.error ||
                "Failed to delete account"
            );
          }
    
          return response.json();
        },
    
        onSuccess: () => {
          localStorage.removeItem("authenticated");
          localStorage.removeItem("token");
    
          queryClient.clear();
    
          window.location.href = "/login";
        }
      });

   return (
    <IonPage className="account-settings-page">
      <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
                <IonMenuButton autoHide={false} />
            </IonButtons>
          <IonTitle >Account Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} className="theme-content">
        <IonGrid>
          
          <IonCol>
            {/* ACCOUNT MANAGEMENT */}
          
              <IonCard className="theme-card" style={{ height: "100%" }}>
                <IonCardHeader>
                  <IonCardTitle>Account Management</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText>
                    <p>
                      Permanently delete your account and all data associated
                      with it.
                    </p>
                  </IonText>

                  <IonButton
                    expand="block"
                    color="danger"
                    disabled={deleteUserMutation.isPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Are you sure you want to permanently delete your account and all associated data? This action cannot be undone."
                      );

                      if (confirmed) {
                        deleteUserMutation.mutate();
                      }
                    }}
                  >
                    {deleteUserMutation.isPending
                      ? "Deleting Account..."
                      : "Delete My Account"}
                  </IonButton>

                  {deleteUserMutation.isError && (
                    <IonText color="danger">
                      <p>
                        {deleteUserMutation.error instanceof Error
                          ? deleteUserMutation.error.message
                          : "Failed to delete account."}
                      </p>
                    </IonText>
                  )}
                </IonCardContent>
              </IonCard>
              </IonCol>
            

            {/* DATA MANAGEMENT */}
            <IonCol>
              <IonCard className="theme-card" style={{ height: "100%" }}>
                <IonCardHeader>
                  <IonCardTitle>Data Management</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText>
                    <p>
                      Remove old dashboard records while keeping your account
                      active.
                    </p>
                  </IonText>

                  <IonButton
                    expand="block"
                    color="warning"
                    disabled={clearMutation.isPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Are you sure you want to clear your old records?"
                      );

                      if (confirmed) {
                        clearMutation.mutate();
                      }
                    }}
                  >
                    {clearMutation.isPending
                      ? "Clearing Records..."
                      : "Clear Old Records"}
                  </IonButton>

                  {clearMutation.isError && (
                    <IonText color="danger">
                      <p>
                        {clearMutation.error instanceof Error
                          ? clearMutation.error.message
                          : "Failed to clear records."}
                      </p>
                    </IonText>
                  )}

                  {clearMutation.isSuccess && (
                    <IonText color="success">
                      <p>Old records cleared successfully.</p>
                    </IonText>
                  )}
                </IonCardContent>
              </IonCard>
        
          </IonCol>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Account;

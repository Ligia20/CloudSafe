import React from "react";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
} from "@ionic/react";

import {
  bug,
  globe,
  lockClosed,
  person,
} from "ionicons/icons";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";


const API_URL = "/api";


/*
 * Badge colors
 */
const getBadgeColor = (
  severity: string | null
) => {

  if (!severity) {
    return "medium";
  }

  switch (severity.toLowerCase().trim()) {

    case "critical":
      return "danger";

    case "high":
      return "warning";

    case "medium":
      return "primary";

    case "low":
      return "success";

    default:
      return "medium";
  }
};



const DashboardPage: React.FC = () => {

  console.log(
    "DASHBOARD PAGE RENDERED"
  );


  /*
   * React Query client
   */
  const queryClient = useQueryClient();


  /*
   * Clear old records mutation
   */
  const clearMutation = useMutation({

    mutationFn: async () => {

      const response = await fetch(
        `${API_URL}/clear`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );


      /*
       * Session expired
       */
      if (response.status === 401) {

        localStorage.removeItem(
          "authenticated"
        );

        window.location.href =
          "/login";

        throw new Error(
          "Session expired"
        );
      }


      /*
       * Backend error
       */
      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
          "Failed to clear old records"
        );
      }


      return response.json();
    },


    /*
     * Refresh dashboard after
     * successful deletion
     */
    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: [
          "securityDashboardData",
        ],
      });
    },

  });



  /*
   * Delete user mutation
   */
  const deleteUserMutation = useMutation({

    mutationFn: async () => {

      const response = await fetch(
        `${API_URL}/account`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );


      /*
       * Session expired
       */
      if (response.status === 401) {

        localStorage.removeItem(
          "authenticated"
        );

        window.location.href =
          "/login";

        throw new Error(
          "Session expired"
        );
      }


      /*
       * Backend error
       */
      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
          "Failed to delete account"
        );
      }


      return response.json();
    },


    /*
     * Account was deleted.
     * Remove the local authentication
     * state and return to login.
     */
    onSuccess: () => {

      localStorage.removeItem(
        "authenticated"
      );

      queryClient.clear();

      window.location.href =
        "/login";

    },

  });



  /*
   * Get dashboard information
   */
  const {
    data,
    isLoading,
    isError,
  } = useQuery({

    queryKey: [
      "securityDashboardData",
    ],

    queryFn: async () => {

      const response = await fetch(
        `${API_URL}/dashboard`,
        {
          credentials: "include",
        }
      );


      /*
       * Session expired
       */
      if (response.status === 401) {

        localStorage.removeItem(
          "authenticated"
        );

        window.location.href =
          "/login";

        throw new Error(
          "Session expired"
        );
      }


      /*
       * Other backend errors
       */
      if (!response.ok) {

        throw new Error(
          "Failed to retrieve dashboard data"
        );
      }


      return response.json();
    },

    retry: false,
  });



  /*
   * Loading
   */
  if (isLoading) {

    return (
      <IonPage>

        <IonHeader>

          <IonToolbar>

            <IonTitle>
              Cloud Safe
            </IonTitle>

          </IonToolbar>

        </IonHeader>


        <IonContent className="ion-padding">

          <h2>
            Loading dashboard...
          </h2>

        </IonContent>

      </IonPage>
    );
  }



  /*
   * Error
   */
  if (isError) {

    return (
      <IonPage>

        <IonHeader>

          <IonToolbar>

            <IonTitle>
              Cloud Safe
            </IonTitle>

          </IonToolbar>

        </IonHeader>


        <IonContent className="ion-padding">

          <IonCard color="danger">

            <IonCardHeader>

              <IonCardTitle>
                Unable to load dashboard
              </IonCardTitle>

            </IonCardHeader>


            <IonCardContent>

              The backend could not be
              reached or your session
              has expired.

            </IonCardContent>

          </IonCard>

        </IonContent>

      </IonPage>
    );
  }



  /*
   * Backend data
   */
  const alerts =
    data?.Recent_Alert_ || [];

  const logs =
    data?.Recent_Logs || [];

  const firstPage =
    data?.firstPage || [];



  /*
   * Active alerts
   */
  const activeAlerts =
    alerts.filter(
      (alert: any) =>
        alert.status === "Active"
    );



  /*
   * Critical alerts
   */
  const criticalAlerts =
    alerts.filter(
      (alert: any) =>
        alert.severity
          ?.toLowerCase() ===
        "critical"
    );



  /*
   * Logs over time
   */
  const chartLogs =
    firstPage.map((log: any) => ({

      time: log.log_time
        ? new Date(
            log.log_time
          ).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "N/A",

      logs: 1,
    }));



  /*
   * Alerts by asset
   */
  const assetAlertMap:
    Record<string, number> = {};


  alerts.forEach(
    (alert: any) => {

      if (alert.asset) {

        assetAlertMap[
          alert.asset
        ] =
          (
            assetAlertMap[
              alert.asset
            ] || 0
          ) + 1;
      }

    }
  );


  const chartAssets =
    Object.keys(
      assetAlertMap
    ).map((name) => ({

      name,

      alerts:
        assetAlertMap[name],

    }));



  /*
   * Recent logs
   */
  const liveLogs =
    firstPage.map((log: any) => ({

      severity:
        log.severity ||
        "Info",

      event:
        log.event ||
        "System Event",

      asset:
        log.asset ||
        "N/A",

      time: log.log_time
        ? new Date(
            log.log_time
          ).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "N/A",

      color:
        getBadgeColor(
          log.severity
        ),

    }));



  return (

    <IonPage>

      {/* Header */}

      <IonHeader>

        <IonToolbar>

          <IonTitle color="primary">
            Cloud Safe
          </IonTitle>

        </IonToolbar>

      </IonHeader>



      <IonContent className="ion-padding">


        {/* Page Title */}

        <h1
          style={{
            color: "#4370e0",
            fontWeight: "bold",
          }}
        >
          Overview of your Security
          Environment
        </h1>



        {/* Stats*/}

        <IonGrid>

          <IonRow>


            {/* Assets */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardSubtitle>
                    Monitored Assets
                  </IonCardSubtitle>

                  <IonCardTitle>
                    8
                  </IonCardTitle>

                </IonCardHeader>


                <IonCardContent>

                  <IonText color="success">
                    Live Network Stream
                  </IonText>

                </IonCardContent>

              </IonCard>

            </IonCol>



            {/* Active Alerts */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardSubtitle>
                    Active Alerts
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {
                      activeAlerts.length
                    }
                  </IonCardTitle>

                </IonCardHeader>


                <IonCardContent>

                  <IonText color="danger">
                    Check Status
                  </IonText>

                </IonCardContent>

              </IonCard>

            </IonCol>



            {/* Total Logs */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardSubtitle>
                    Total Logs
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {logs.length}
                  </IonCardTitle>

                </IonCardHeader>


                <IonCardContent>

                  <IonText color="success">
                    Indexed rows
                  </IonText>

                </IonCardContent>

              </IonCard>

            </IonCol>



            {/* Critical Alerts */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardSubtitle>
                    Critical Alerts
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {
                      criticalAlerts.length
                    }
                  </IonCardTitle>

                </IonCardHeader>


                <IonCardContent>

                  <IonText color="danger">
                    Urgent items
                  </IonText>

                </IonCardContent>

              </IonCard>

            </IonCol>

          </IonRow>

        </IonGrid>



        <IonGrid>

          <IonRow>


            {/* Logs chart */}

            <IonCol
              size="12"
              sizeMd="6"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>
                    Logs Over Time
                  </IonCardTitle>

                </IonCardHeader>


                <IonCardContent>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <AreaChart
                      data={chartLogs}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="time"
                      />

                      <YAxis />

                      <RechartsTooltip />

                      <Area
                        type="monotone"
                        dataKey="logs"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </IonCardContent>

              </IonCard>

            </IonCol>


            <IonCol
              size="12"
              sizeMd="6"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>
                    Top Assets By Alert
                  </IonCardTitle>

                </IonCardHeader>


                <IonCardContent>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <AreaChart
                      data={chartAssets}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis />

                      <RechartsTooltip />

                      <Area
                        type="monotone"
                        dataKey="alerts"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </IonCardContent>

              </IonCard>

            </IonCol>

          </IonRow>

        </IonGrid>


        <IonGrid>

          <IonRow>

            <IonCol size="12">


              <IonButton
                routerLink="/assets"
              >
                View all Assets
              </IonButton>


              <IonButton
                routerLink="/logs"
              >
                View all Logs
              </IonButton>


              <IonButton
                color="danger"
                disabled={
                  clearMutation.isPending
                }
                onClick={() => {

                  const confirmed =
                    window.confirm(
                      "Clear old logs and alerts according to their retention periods?"
                    );

                  if (confirmed) {
                    clearMutation.mutate();
                  }

                }}
              >

                {clearMutation.isPending
                  ? "Clearing..."
                  : "Clear Old Records"}

              </IonButton>


              <IonButton
                color="danger"
                fill="outline"
                disabled={
                  deleteUserMutation.isPending
                }
                onClick={() => {

                  const confirmed =
                    window.confirm(
                      "WARNING: This will permanently delete your account, logs, alerts, and assets. This action cannot be undone. Continue?"
                    );

                  if (confirmed) {
                    deleteUserMutation.mutate();
                  }

                }}
              >

                {deleteUserMutation.isPending
                  ? "Deleting Account..."
                  : "Delete Account"}

              </IonButton>


              {clearMutation.isSuccess && (

                <IonCard color="success">

                  <IonCardContent>

                    Old records cleared
                    successfully.

                  </IonCardContent>

                </IonCard>

              )}



              {/* =========================
                  CLEAR ERROR
              ========================== */}

              {clearMutation.isError && (

                <IonCard color="danger">

                  <IonCardContent>

                    {clearMutation.error instanceof Error
                      ? clearMutation.error.message
                      : "Failed to clear old records."}

                  </IonCardContent>

                </IonCard>

              )}



              {/* Delete account error */}

              {deleteUserMutation.isError && (

                <IonCard color="danger">

                  <IonCardContent>

                    {deleteUserMutation.error instanceof Error
                      ? deleteUserMutation.error.message
                      : "Failed to delete account."}

                  </IonCardContent>

                </IonCard>

              )}



              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>
                    Recent Logs
                  </IonCardTitle>

                </IonCardHeader>


                <IonList>

                  {liveLogs.map(
                    (
                      log: any,
                      index: number
                    ) => (

                      <IonItem
                        key={index}
                      >

                        <IonBadge
                          color={log.color}
                          slot="start"
                        >
                          {log.severity}
                        </IonBadge>


                        <IonLabel>

                          <h2>
                            {log.event}
                          </h2>

                          <p>
                            Asset:{" "}
                            {log.asset}
                          </p>

                          <p>
                            Time:{" "}
                            {log.time}
                          </p>

                        </IonLabel>

                      </IonItem>

                    )
                  )}

                </IonList>

              </IonCard>

            </IonCol>

          </IonRow>

        </IonGrid>



        {/* Attack simulator */}

        <h1
          style={{
            color: "#4370e0",
            fontWeight: "bold",
          }}
        >
          Attack Simulator
        </h1>


        <IonGrid>

          <IonRow>


            {/* Brute Force */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>

                    Brute Force{" "}

                    <IonIcon
                      icon={lockClosed}
                    />

                  </IonCardTitle>

                </IonCardHeader>

              </IonCard>

            </IonCol>



            {/* Port Scan */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>

                    Port Scan{" "}

                    <IonIcon
                      icon={globe}
                    />

                  </IonCardTitle>

                </IonCardHeader>

              </IonCard>

            </IonCol>



            {/* Malware */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>

                    Malware{" "}

                    <IonIcon
                      icon={bug}
                    />

                  </IonCardTitle>

                </IonCardHeader>

              </IonCard>

            </IonCol>



            {/* Unauthorized Access */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard>

                <IonCardHeader>

                  <IonCardTitle>

                    Unauthorized Access{" "}

                    <IonIcon
                      icon={person}
                    />

                  </IonCardTitle>

                </IonCardHeader>

              </IonCard>

            </IonCol>

          </IonRow>

        </IonGrid>


      </IonContent>

    </IonPage>
  );
};


export default DashboardPage;
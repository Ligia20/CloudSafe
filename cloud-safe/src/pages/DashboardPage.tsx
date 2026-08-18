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
  useIonViewWillEnter,
  IonMenuButton,
  IonButtons,
} from "@ionic/react";

import {
  bug,
  globe,
  lockClosed,
  person,
  cloud
} from "ionicons/icons";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import "./DashboardPage.css";

const API_URL = "/api";

const getToken = () => {
  return localStorage.getItem("token");
};


// =========================================================
// AUTH
// =========================================================

const handleUnauthorized = () => {
  localStorage.removeItem("authenticated");
  localStorage.removeItem("token");

  window.location.href = "/login";
};

const getBadgeColor = (severity: string | null) => {
  if (!severity) return "medium";

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

const authHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};


// =========================================================
// DASHBOARD
// =========================================================

const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const contentRef =
    React.useRef<HTMLIonContentElement>(null);

  useIonViewWillEnter(() => {
    setTimeout(() => {
      contentRef.current?.scrollToTop(0);
    }, 0);
  });



  // =======================================================
  // ATTACK SIMULATOR
  // =======================================================

  const simulateMutation = useMutation({
    mutationFn: async (attackType: string) => {
      const response = await fetch(
        `${API_URL}/v1/simulate/${attackType}`,
        {
          method: "POST",
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
            "Simulation failed"
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
    }
  });


  // =======================================================
  // SUMMARY QUERY
  // =======================================================

  const summaryQuery = useQuery({
    queryKey: ["securityDashboardData"],

    queryFn: async () => {
      const token = getToken();

      if (!token) {
        handleUnauthorized();

        throw new Error(
          "Authentication token missing"
        );
      }

      const response = await fetch(
        `${API_URL}/v1/dashboard/summary`,
        {
          method: "GET",
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
            "Failed to retrieve dashboard data"
        );
      }

      return response.json();
    },

    retry: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });


  // =======================================================
  // EVENTS
  // =======================================================

  const eventsQuery = useQuery({
    queryKey: ["dashboardEvents"],

    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/v1/dashboard/events`,
        {
          method: "GET",
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
            "Failed to retrieve events"
        );
      }

      return response.json();
    },

    retry: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });


  // =======================================================
  // ALERTS
  // =======================================================

  const alertsQuery = useQuery({
    queryKey: ["dashboardAlerts"],

    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/v1/dashboard/alerts`,
        {
          method: "GET",
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
            "Failed to retrieve alerts"
        );
      }

      return response.json();
    },

    retry: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });


  // =======================================================
  // RECENT
  // =======================================================

  const recentQuery = useQuery({
    queryKey: ["dashboardRecent"],

    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/v1/dashboard/recent`,
        {
          method: "GET",
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
            "Failed to retrieve recent data"
        );
      }

      return response.json();
    },

    retry: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });


  // =======================================================
  // LOADING
  // =======================================================

  const isLoading =
    summaryQuery.isLoading ||
    eventsQuery.isLoading ||
    alertsQuery.isLoading ||
    recentQuery.isLoading;


  // =======================================================
  // ERROR
  // =======================================================

  const isError =
    summaryQuery.isError ||
    eventsQuery.isError ||
    alertsQuery.isError ||
    recentQuery.isError;


  if (isLoading) {
    return (
      <IonPage>

        <IonHeader className="theme-header">
          <IonToolbar>

            <IonTitle className="theme-title">
              Cloud Safe{" "}
              <IonIcon icon={cloud} />
            </IonTitle>

          </IonToolbar>
        </IonHeader>

        <IonContent className="theme-content ion-padding">

          <h2>
            Loading dashboard...
          </h2>

        </IonContent>

      </IonPage>
    );
  }


  if (isError) {
    return (
      <IonPage>

        <IonHeader className="theme-header">
          <IonToolbar>

            <IonTitle className="theme-title">
              Cloud Safe
            </IonTitle>

          </IonToolbar>
        </IonHeader>

        <IonContent
          ref={contentRef}
          className="theme-content ion-padding"
        >

          <IonCard className="theme-card">

            <IonCardHeader>

              <IonCardTitle>
                Unable to load dashboard
              </IonCardTitle>

            </IonCardHeader>

            <IonCardContent>

              The backend could not be reached
              or your session has expired.

            </IonCardContent>

          </IonCard>

        </IonContent>

      </IonPage>
    );
  }


  // =======================================================
  // DATA
  // =======================================================

  const data = summaryQuery.data || {};

  const events =
    eventsQuery.data || [];

  const alerts =
    alertsQuery.data || [];

  const recent =
    recentQuery.data || {};


  const totalAssets =
    data.totalAssets ?? 0;

  const totalEvents =
    data.totalEvents ?? 0;

  const activeAlerts =
    data.activeAlerts ?? 0;

  const criticalAlerts =
    data.criticalAlerts ?? 0;

  const highAlerts =
    data.highAlerts ?? 0;

  const mediumAlerts =
    data.mediumAlerts ?? 0;

  const lowAlerts =
    data.lowAlerts ?? 0;

  const investigatingAlerts =
    data.investigatingAlerts ?? 0;

  const resolvedAlerts =
    data.resolvedAlerts ?? 0;


  const recentEvents =
    recent.events ||
    events.slice(0, 10);


  const recentAlerts =
    recent.alerts ||
    alerts.slice(0, 10);


  // =======================================================
  // CHART DATA
  // =======================================================

  const chartAlerts = [
    {
      name: "Critical",
      alerts: criticalAlerts
    },
    {
      name: "High",
      alerts: highAlerts
    },
    {
      name: "Medium",
      alerts: mediumAlerts
    },
    {
      name: "Low",
      alerts: lowAlerts
    }
  ];


  const chartEvents = [
    {
      name: "Events",
      events: totalEvents
    }
  ];


  const chartRecentEvents =
    recentEvents.map(
      (
        event: any,
        index: number
      ) => ({
        name: event.timestamp
          ? new Date(
              event.timestamp
            ).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            )
          : `${index + 1}`,

        events: 1
      })
    );


  const displayEvents =
    chartRecentEvents.length > 0
      ? chartRecentEvents
      : chartEvents;


  // =======================================================
  // PAGE
  // =======================================================

  return (
    <IonPage id="main">

      {/* =================================================
          HEADER
          ================================================= */}

      <IonHeader className="theme-header">

        <IonToolbar>

          <IonButtons slot="start">
            <IonMenuButton autoHide={false} />
          </IonButtons>

          <IonTitle className="theme-title">
            Cloud Safe{" "}
            <IonIcon icon={cloud} />
          </IonTitle>

        </IonToolbar>

      </IonHeader>


      {/* =================================================
          CONTENT
          ================================================= */}

      <IonContent
        ref={contentRef}
        className="theme-content ion-padding"
        scrollEvents={false}
      >

        {/* =================================================
            OVERVIEW HEADING
            ================================================= */}

        <h1 className="theme-heading">
          Overview of your Security Environment
        </h1>


        {/* =================================================
            STAT CARDS
            ================================================= */}

        <IonGrid>

          <IonRow>

            {/* Monitored Assets */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard
                className="theme-card"
                button
                routerLink="/assets"
              >

                <IonCardHeader>

                  <IonCardSubtitle>
                    Monitored Assets
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {totalAssets}
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

              <IonCard
                className="theme-card"
                button
                routerLink="/alerts"
              >

                <IonCardHeader>

                  <IonCardSubtitle>
                    Active Alerts
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {activeAlerts}
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

              <IonCard
                className="theme-card"
                button
                routerLink="/logs"
              >

                <IonCardHeader>

                  <IonCardSubtitle>
                    Total Logs
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {totalEvents}
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

              <IonCard
                className="theme-card"
                button
                routerLink="/alerts?severity=critical"
              >

                <IonCardHeader>

                  <IonCardSubtitle>
                    Critical Alerts
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {criticalAlerts}
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


        {/* =================================================
            CHARTS
            ================================================= */}

        <IonGrid>

          <IonRow>

            {/* Events Chart */}

            <IonCol
              size="12"
              sizeMd="6"
            >

              <IonCard className="theme-card chart-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Events Over Time
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <AreaChart
                      data={displayEvents}
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
                        dataKey="events"
                        stroke="#6fa3ff"
                        fill="#6fa3ff"
                        fillOpacity={0.25}
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </IonCardContent>

              </IonCard>

            </IonCol>


            {/* Alerts Chart */}

            <IonCol
              size="12"
              sizeMd="6"
            >

              <IonCard className="theme-card chart-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Alerts by Severity
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <AreaChart
                      data={chartAlerts}
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
                        fillOpacity={0.25}
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </IonCardContent>

              </IonCard>

            </IonCol>

          </IonRow>

        </IonGrid>


        {/* =================================================
            SECURITY SUMMARY + RECENT EVENTS + RECENT ALERTS
            ================================================= */}

        <IonGrid>

          <IonRow>

            {/* =================================================
                SECURITY SUMMARY
                ================================================= */}

            <IonCol
              size="12"
              sizeMd="4"
            >

              <IonCard className="theme-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Security Summary
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <IonList>

                    <IonItem>

                      <IonLabel>
                        Total Events
                      </IonLabel>

                      <IonBadge slot="end">
                        {totalEvents}
                      </IonBadge>

                    </IonItem>


                    <IonItem>

                      <IonLabel>
                        Total Assets
                      </IonLabel>

                      <IonBadge slot="end">
                        {totalAssets}
                      </IonBadge>

                    </IonItem>


                    <IonItem>

                      <IonLabel>
                        Active Alerts
                      </IonLabel>

                      <IonBadge
                        color="danger"
                        slot="end"
                      >
                        {activeAlerts}
                      </IonBadge>

                    </IonItem>


                    <IonItem>

                      <IonLabel>
                        Investigating
                      </IonLabel>

                      <IonBadge
                        color="warning"
                        slot="end"
                      >
                        {investigatingAlerts}
                      </IonBadge>

                    </IonItem>


                    <IonItem>

                      <IonLabel>
                        Resolved
                      </IonLabel>

                      <IonBadge
                        color="success"
                        slot="end"
                      >
                        {resolvedAlerts}
                      </IonBadge>

                    </IonItem>


                    <IonItem>

                      <IonLabel>
                        Critical
                      </IonLabel>

                      <IonBadge
                        color="danger"
                        slot="end"
                      >
                        {criticalAlerts}
                      </IonBadge>

                    </IonItem>


                    <IonItem>

                      <IonLabel>
                        High
                      </IonLabel>

                      <IonBadge
                        color="warning"
                        slot="end"
                      >
                        {highAlerts}
                      </IonBadge>

                    </IonItem>

                  </IonList>

                </IonCardContent>

              </IonCard>

            </IonCol>


            {/* =================================================
                RECENT EVENTS
                ================================================= */}

            <IonCol
              size="12"
              sizeMd="4"
            >

              <IonCard className="theme-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Recent Events
                  </IonCardTitle>

                </IonCardHeader>

                <IonList>

                  {recentEvents.length === 0 && (
                    <IonItem>

                      <IonLabel>
                        No recent events.
                      </IonLabel>

                    </IonItem>
                  )}


                  {recentEvents
                    .slice(0, 5)
                    .map(
                      (
                        event: any,
                        index: number
                      ) => (

                        <IonItem
                          key={
                            event.id ||
                            index
                          }
                        >

                          <IonBadge
                            color={getBadgeColor(
                              event.severity
                            )}
                            slot="start"
                          >
                            {event.severity ||
                              "INFO"}
                          </IonBadge>

                          <IonLabel>

                            <h2>
                              {event.eventType ||
                                event.event ||
                                "Security Event"}
                            </h2>

                            <p>
                              {event.message ||
                                event.action ||
                                "Event detected"}
                            </p>

                            <p>
                              Source:{" "}
                              {event.sourceIp ||
                                "N/A"}
                            </p>

                            <p>
                              Time:{" "}
                              {event.timestamp
                                ? new Date(
                                    event.timestamp
                                  ).toLocaleString()
                                : "N/A"}
                            </p>

                          </IonLabel>

                        </IonItem>

                      )
                    )}

                </IonList>

              </IonCard>

            </IonCol>


            {/* =================================================
                RECENT ALERTS
                ================================================= */}

            <IonCol
              size="12"
              sizeMd="4"
            >

              <IonCard className="theme-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Recent Alerts
                  </IonCardTitle>

                </IonCardHeader>

                <IonList>

                  {recentAlerts.length === 0 && (
                    <IonItem>

                      <IonLabel>
                        No recent alerts.
                      </IonLabel>

                    </IonItem>
                  )}


                  {recentAlerts
                    .slice(0, 5)
                    .map(
                      (
                        alert: any,
                        index: number
                      ) => (

                        <IonItem
                          key={
                            alert.alert_id ||
                            index
                          }
                        >

                          <IonBadge
                            color={getBadgeColor(
                              alert.severity
                            )}
                            slot="start"
                          >
                            {alert.severity ||
                              "INFO"}
                          </IonBadge>

                          <IonLabel>

                            <h2>
                              {alert.alert_name_ ||
                                alert.alert_name ||
                                "Security Alert"}
                            </h2>

                            <p>
                              Asset:{" "}
                              {alert.asset ||
                                "N/A"}
                            </p>

                            <p>
                              Status:{" "}
                              {alert.status ||
                                "N/A"}
                            </p>

                            <p>
                              Time:{" "}
                              {alert.alert_time
                                ? new Date(
                                    alert.alert_time
                                  ).toLocaleString()
                                : "N/A"}
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


        {/* =================================================
            SIMULATION STATUS
            ================================================= */}

        <IonGrid>

          <IonRow>

            <IonCol size="12">

              {simulateMutation.isError && (

                <IonCard color="danger">

                  <IonCardContent>

                    {simulateMutation.error instanceof Error
                      ? simulateMutation.error.message
                      : "Failed to run attack simulation."}

                  </IonCardContent>

                </IonCard>

              )}


              {simulateMutation.isSuccess && (

                <IonCard color="success">

                  <IonCardContent>

                    Attack simulation completed successfully.

                  </IonCardContent>

                </IonCard>

              )}

            </IonCol>

          </IonRow>

        </IonGrid>


        {/* =================================================
            ATTACK SIMULATOR HEADING
            ================================================= */}

        <h1 className="theme-heading simulator-heading">
          Attack Simulator
        </h1>


        {/* =================================================
            ATTACK SIMULATOR
            ================================================= */}

        <IonGrid>

          <IonRow>

            {/* Brute Force */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard className="theme-card simulator-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Brute Force{" "}
                    <IonIcon icon={lockClosed} />
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <IonButton
                    expand="block"
                    color="danger"
                    disabled={
                      simulateMutation.isPending
                    }
                    onClick={() =>
                      simulateMutation.mutate(
                        "brute-force"
                      )
                    }
                  >
                    {simulateMutation.isPending
                      ? "Simulating..."
                      : "Simulate"}
                  </IonButton>

                </IonCardContent>

              </IonCard>

            </IonCol>


            {/* Port Scan */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard className="theme-card simulator-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Port Scan{" "}
                    <IonIcon icon={globe} />
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <IonButton
                    expand="block"
                    color="warning"
                    disabled={
                      simulateMutation.isPending
                    }
                    onClick={() =>
                      simulateMutation.mutate(
                        "port-scan"
                      )
                    }
                  >
                    {simulateMutation.isPending
                      ? "Simulating..."
                      : "Simulate"}
                  </IonButton>

                </IonCardContent>

              </IonCard>

            </IonCol>


            {/* Malware */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard className="theme-card simulator-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Malware{" "}
                    <IonIcon icon={bug} />
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <IonButton
                    expand="block"
                    color="danger"
                    disabled={
                      simulateMutation.isPending
                    }
                    onClick={() =>
                      simulateMutation.mutate(
                        "malware"
                      )
                    }
                  >
                    {simulateMutation.isPending
                      ? "Simulating..."
                      : "Simulate"}
                  </IonButton>

                </IonCardContent>

              </IonCard>

            </IonCol>


            {/* Unauthorized Access */}

            <IonCol
              size="12"
              sizeSm="6"
              sizeMd="3"
            >

              <IonCard className="theme-card simulator-card">

                <IonCardHeader>

                  <IonCardTitle>
                    Unauthorized Access{" "}
                    <IonIcon icon={person} />
                  </IonCardTitle>

                </IonCardHeader>

                <IonCardContent>

                  <IonButton
                    expand="block"
                    color="danger"
                    disabled={
                      simulateMutation.isPending
                    }
                    onClick={() =>
                      simulateMutation.mutate(
                        "unauthorized-access"
                      )
                    }
                  >
                    {simulateMutation.isPending
                      ? "Simulating..."
                      : "Simulate"}
                  </IonButton>

                </IonCardContent>

              </IonCard>

            </IonCol>

          </IonRow>

        </IonGrid>


      </IonContent>

    </IonPage>
  );
};

export default DashboardPage;
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
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const API_URL = "http://localhost:3000";

const queryClient = new QueryClient();

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

const DashboardContent: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["securityDashboardData"],

    queryFn: async () => {
      const response = await fetch(`${API_URL}/dashboard`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
        }

        throw new Error("Failed to retrieve dashboard data");
      }

      return response.json();
    },

    retry: false,
  });

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <h2>Loading dashboard...</h2>
        </IonContent>
      </IonPage>
    );
  }

  if (isError) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Cloud Safe</IonTitle>
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
              The backend could not be reached or your session
              has expired.
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  const alerts = data?.Recent_Alert_ || [];
  const logs = data?.Recent_Logs || [];
  const firstPage = data?.firstPage || [];

  const activeAlerts = alerts.filter(
    (alert: any) => alert.status === "Active"
  );

  const criticalAlerts = alerts.filter(
    (alert: any) =>
      alert.severity?.toLowerCase() === "critical"
  );

  const chartLogs = firstPage.map((log: any) => ({
    time: log.log_time
      ? new Date(log.log_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",

    logs: 1,
  }));

  const assetAlertMap: Record<string, number> = {};

  alerts.forEach((alert: any) => {
    if (alert.asset) {
      assetAlertMap[alert.asset] =
        (assetAlertMap[alert.asset] || 0) + 1;
    }
  });

  const chartAssets = Object.keys(assetAlertMap).map(
    (name) => ({
      name,
      alerts: assetAlertMap[name],
    })
  );

  const liveLogs = firstPage.map((log: any) => ({
    severity: log.severity || "Info",
    event: log.event || "System Event",
    asset: log.asset || "N/A",

    time: log.log_time
      ? new Date(log.log_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",

    color: getBadgeColor(log.severity),
  }));

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar>
          <IonTitle color="primary">
            Cloud Safe
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <h1
          style={{
            color: "#4370e0",
            fontWeight: "bold",
          }}
        >
          Overview of your Security Environment
        </h1>

        {/* STATISTICS */}

        <IonGrid>
          <IonRow>

            <IonCol size="12" sizeSm="6" sizeMd="3">
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

            <IonCol size="12" sizeSm="6" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>
                    Active Alerts
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {activeAlerts.length}
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonText color="danger">
                    Check Status
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeMd="3">
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

            <IonCol size="12" sizeSm="6" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>
                    Critical Alerts
                  </IonCardSubtitle>

                  <IonCardTitle>
                    {criticalAlerts.length}
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

        {/* CHARTS */}

        <IonGrid>
          <IonRow>

            <IonCol size="12" sizeMd="6">
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
                    <AreaChart data={chartLogs}>

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="time" />

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

            <IonCol size="12" sizeMd="6">
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
                    <AreaChart data={chartAssets}>

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="name" />

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

        {/* LOGS */}

        <IonGrid>
          <IonRow>

            <IonCol size="12">

              <IonButton routerLink="/assets">
                View all Assets
              </IonButton>

              <IonButton routerLink="/logs">
                View all Logs
              </IonButton>

              <IonCard>

                <IonCardHeader>
                  <IonCardTitle>
                    Recent Logs
                  </IonCardTitle>
                </IonCardHeader>

                <IonList>

                  {liveLogs.map(
                    (log: any, index: number) => (

                      <IonItem key={index}>

                        <IonBadge
                          color={log.color}
                          slot="start"
                        >
                          {log.severity}
                        </IonBadge>

                        <IonLabel>
                          <h2>{log.event}</h2>

                          <p>
                            Asset: {log.asset}
                          </p>

                          <p>
                            Time: {log.time}
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

        {/* ATTACK SIMULATOR */}

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

            <IonCol size="12" sizeSm="6" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    Brute Force{" "}
                    <IonIcon icon={lockClosed} />
                  </IonCardTitle>
                </IonCardHeader>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    Port Scan{" "}
                    <IonIcon icon={globe} />
                  </IonCardTitle>
                </IonCardHeader>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    Malware{" "}
                    <IonIcon icon={bug} />
                  </IonCardTitle>
                </IonCardHeader>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeMd="3">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    Unauthorized Access{" "}
                    <IonIcon icon={person} />
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


/*
 * Provider goes OUTSIDE DashboardContent.
 */
const DashboardPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default DashboardPage;
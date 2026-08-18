import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonPopover,
  IonText,
  IonButtons,
  IonMenuButton,
  useIonRouter,
} from "@ionic/react";

import React, { useEffect, useState } from "react";

import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import "./log.css";

const API_URL = "/api";

interface LogItem {
  id: string;
  assetId: string;
  asset: string | null;
  hostname?: string | null;
  sourceIp: string | null;
  eventType: string;
  message: string;
  category?: string | null;
  severity: string;
  action?: string | null;
  timestamp: string;
}

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
    "Content-Type": "application/json",
  };
};

const Log: React.FC = () => {
  const ionRouter = useIonRouter();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("all");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // =======================================================
  // CLEAR LOGS
  // =======================================================

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();

      if (!token) {
        handleUnauthorized();

        throw new Error(
          "Authentication token missing"
        );
      }

      const response = await fetch(
        `${API_URL}/v1/clear`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      /*
       * IMPORTANT:
       * A 401 does NOT count as a successful clear.
       */
      if (response.status === 401) {
        handleUnauthorized();

        throw new Error(
          "Session expired"
        );
      }

      /*
       * Any non-2xx response is a failure.
       * Therefore onSuccess will NOT run.
       */
      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
            "Failed to clear logs"
        );
      }

      return response.json();
    },

    /*
     * THIS IS THE ONLY PLACE WHERE
     * CLEAR LOGS REDIRECTS TO DASHBOARD.
     */
    onSuccess: () => {
      /*
       * Remove the logs from the current page.
       */
      setLogs([]);

      /*
       * Clear cached dashboard information so
       * the dashboard requests fresh data.
       */
      queryClient.removeQueries({
        queryKey: ["securityDashboardData"],
      });

      queryClient.removeQueries({
        queryKey: ["dashboardEvents"],
      });

      queryClient.removeQueries({
        queryKey: ["dashboardAlerts"],
      });

      queryClient.removeQueries({
        queryKey: ["dashboardRecent"],
      });

      /*
       * REDIRECT ONLY AFTER THE DELETE REQUEST
       * SUCCESSFULLY COMPLETES.
       */
      ionRouter.push(
        "/dashboard",
        "root",
        "replace"
      );
    },
  });

  // =======================================================
  // GET LOGS
  // =======================================================

  useEffect(() => {
    const getLogs = async () => {
      try {
        setError("");
        setLoading(true);

        const token = getToken();

        if (!token) {
          handleUnauthorized();
          return;
        }

        const response = await fetch(
          `${API_URL}/v1/dashboard/events`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data =
          await response
            .json()
            .catch(() => null);

        console.log(
          "LOG RESPONSE:",
          response.status
        );

        console.log(
          "LOG DATA:",
          data
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          setError(
            data?.error ||
              "Unable to load logs"
          );

          return;
        }

        const events =
          Array.isArray(data)
            ? data
            : [];

        setLogs(
          events.map((event: any) => ({
            id: event.id,
            assetId: event.assetId,

            asset:
              event.asset?.name ||
              event.assetId ||
              null,

            hostname:
              event.asset?.hostname ||
              null,

            sourceIp:
              event.sourceIp ||
              null,

            eventType:
              event.eventType ||
              "Security Event",

            message:
              event.message ||
              "",

            category:
              event.category ||
              null,

            severity:
              event.severity ||
              "INFO",

            action:
              event.action ||
              null,

            timestamp:
              event.timestamp,
          }))
        );
      } catch (error) {
        console.error(
          "GET LOGS ERROR:",
          error
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

    getLogs();
  }, []);

  // =======================================================
  // FILTER LOGS
  // =======================================================

  const filteredLogs = logs.filter(log => {
    const search =
      searchText.toLowerCase();

    const matchesSearch =
      log.asset
        ?.toLowerCase()
        .includes(search) ||
      log.eventType
        ?.toLowerCase()
        .includes(search) ||
      log.message
        ?.toLowerCase()
        .includes(search) ||
      log.severity
        ?.toLowerCase()
        .includes(search) ||
      log.action
        ?.toLowerCase()
        .includes(search) ||
      log.sourceIp
        ?.toLowerCase()
        .includes(search);

    const matchesSeverity =
      selectedSeverity === "all" ||
      log.severity?.toLowerCase() ===
        selectedSeverity.toLowerCase();

    const assetName =
      log.asset
        ?.toLowerCase()
        .replace(/\s+/g, "-");

    const matchesAsset =
      selectedAsset === "all" ||
      assetName ===
        selectedAsset.toLowerCase();

    const logDate =
      new Date(log.timestamp);

    const now = new Date();

    let matchesTime = true;

    if (selectedTime === "24hrs") {
      matchesTime =
        now.getTime() -
          logDate.getTime() <=
        24 * 60 * 60 * 1000;
    }

    if (selectedTime === "48hrs") {
      matchesTime =
        now.getTime() -
          logDate.getTime() <=
        48 * 60 * 60 * 1000;
    }

    if (selectedTime === "7days") {
      matchesTime =
        now.getTime() -
          logDate.getTime() <=
        7 * 24 * 60 * 60 * 1000;
    }

    if (selectedTime === "30days") {
      matchesTime =
        now.getTime() -
          logDate.getTime() <=
        30 * 24 * 60 * 60 * 1000;
    }

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesAsset &&
      matchesTime
    );
  });

  // =======================================================
  // SORT LOGS
  // =======================================================

  const sortedLogs =
    [...filteredLogs].sort((a, b) => {
      const timeA =
        new Date(
          a.timestamp
        ).getTime();

      const timeB =
        new Date(
          b.timestamp
        ).getTime();

      if (selectedSort === "newest") {
        return timeB - timeA;
      }

      return timeA - timeB;
    });

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <IonPage className="log-page">

      <IonHeader>
        <IonToolbar>

          <IonButtons slot="start">
            <IonMenuButton autoHide={false} />
          </IonButtons>

          <IonTitle className="title">
            Logs
          </IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent>

        <div className="title-content">
          View and analyze security events and systems logs
        </div>

        {loading && (
          <IonText>
            <p className="ion-padding">
              Loading logs...
            </p>
          </IonText>
        )}

        {error && (
          <IonText color="danger">
            <p className="ion-padding">
              {error}
            </p>
          </IonText>
        )}

        <div className="search-bar-content">

          <IonSearchbar
            className="search-bar"
            value={searchText}
            onIonInput={e =>
              setSearchText(
                e.detail.value ?? ""
              )
            }
          />

          <IonSelect
            className="search-bar_severities"
            placeholder="All Severities"
            value={selectedSeverity}
            onIonChange={e =>
              setSelectedSeverity(
                e.detail.value
              )
            }
          >
            <IonSelectOption value="all">
              All Severities
            </IonSelectOption>

            <IonSelectOption value="critical">
              Critical
            </IonSelectOption>

            <IonSelectOption value="high">
              High
            </IonSelectOption>

            <IonSelectOption value="medium">
              Medium
            </IonSelectOption>

            <IonSelectOption value="low">
              Low
            </IonSelectOption>

            <IonSelectOption value="info">
              Informational
            </IonSelectOption>

          </IonSelect>

          <IonSelect
            className="search-bar_assets"
            placeholder="All Assets"
            value={selectedAsset}
            onIonChange={e =>
              setSelectedAsset(
                e.detail.value
              )
            }
          >
            <IonSelectOption value="all">
              All Assets
            </IonSelectOption>

            <IonSelectOption value="web-server">
              Web Server
            </IonSelectOption>

            <IonSelectOption value="database-server">
              Database Server
            </IonSelectOption>

            <IonSelectOption value="firewall">
              Firewall
            </IonSelectOption>

            <IonSelectOption value="vpn-gateway">
              VPN Gateway
            </IonSelectOption>

            <IonSelectOption value="mail-server">
              Mail Server
            </IonSelectOption>

          </IonSelect>

          <IonButton
            className="search-bar_filterBtn"
            onClick={() =>
              setIsOpen(true)
            }
          >
            Filter
          </IonButton>

          {/* =================================================
              CLEAR LOGS
              ================================================= */}

          <IonButton
            color="danger"
            disabled={
              clearLogsMutation.isPending
            }
            onClick={() => {
              const confirmed =
                window.confirm(
                  "Are you sure you want to clear all logs? This action cannot be undone."
                );

              if (!confirmed) {
                return;
              }

              /*
               * This ONLY starts the mutation.
               *
               * It does NOT redirect.
               *
               * The redirect happens in onSuccess()
               * after the server confirms deletion.
               */
              clearLogsMutation.mutate();
            }}
          >
            {clearLogsMutation.isPending
              ? "Clearing Logs..."
              : "Clear Logs"}
          </IonButton>

        </div>

        {/* =================================================
            CLEAR LOG ERROR
            ================================================= */}

        {clearLogsMutation.isError && (
          <IonText color="danger">

            <p className="ion-padding">
              {clearLogsMutation.error instanceof Error
                ? clearLogsMutation.error.message
                : "Failed to clear logs."}
            </p>

          </IonText>
        )}

        {/* =================================================
            FILTER POPOVER
            ================================================= */}

        <IonPopover
          isOpen={isOpen}
          onDidDismiss={() =>
            setIsOpen(false)
          }
        >
          <IonContent>

            <IonSelect
              className="search-bar_sortDt"
              placeholder="Sort by"
              value={selectedSort}
              onIonChange={e =>
                setSelectedSort(
                  e.detail.value
                )
              }
            >

              <IonSelectOption value="newest">
                Newest
              </IonSelectOption>

              <IonSelectOption value="oldest">
                Oldest
              </IonSelectOption>

            </IonSelect>

            <IonSelect
              className="search-bar_timeRange"
              placeholder="Time range"
              value={selectedTime}
              onIonChange={e =>
                setSelectedTime(
                  e.detail.value
                )
              }
            >

              <IonSelectOption value="all">
                All time
              </IonSelectOption>

              <IonSelectOption value="24hrs">
                Last 24 hours
              </IonSelectOption>

              <IonSelectOption value="48hrs">
                Last 48 hours
              </IonSelectOption>

              <IonSelectOption value="7days">
                Last 7 days
              </IonSelectOption>

              <IonSelectOption value="30days">
                Last 30 days
              </IonSelectOption>

            </IonSelect>

          </IonContent>
        </IonPopover>

        {/* =================================================
            LOG TABLE
            ================================================= */}

        <div className="logs-container">

          <div className="log-header">

            <p>Asset</p>
            <p>Category</p>
            <p>Source IP</p>
            <p>Event</p>
            <p>Severity</p>
            <p>Time</p>

          </div>

          {sortedLogs.map(log => (

            <div
              key={log.id}
              className="log-row"
            >

              <p>
                {log.asset ?? "-"}
              </p>

              <p>
                {log.category ??
                  "Security Event"}
              </p>

              <p>
                {log.sourceIp ?? "-"}
              </p>

              <p>

                {log.eventType}

                {log.message && (
                  <>
                    <br />

                    <small>
                      {log.message}
                    </small>
                  </>
                )}

              </p>

              <p>
                {log.severity}
              </p>

              <p>
                {new Date(
                  log.timestamp
                ).toLocaleString()}
              </p>

            </div>

          ))}

          {sortedLogs.length === 0 &&
            !error &&
            !loading && (

              <div className="no-logs">
                No logs found.
              </div>

            )}

        </div>

      </IonContent>

    </IonPage>
  );
};

export default Log;

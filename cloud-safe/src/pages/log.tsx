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
} from "@ionic/react";

import React, { useEffect, useState } from "react";

import "./log.css";


const API_URL = "/api";


const Log: React.FC = () => {

  interface LogItem {
    log_id: string;
    asset: string | null;
    source_ip: string;
    event: string;
    severity: string;
    action: string;
    log_time: string;
  }


  const [searchText, setSearchText] = useState("");

  const [selectedSeverity, setSelectedSeverity] =
    useState("all");

  const [selectedAsset, setSelectedAsset] =
    useState("all");

  const [selectedSort, setSelectedSort] =
    useState("newest");

  const [isOpen, setIsOpen] =
    useState(false);

  const [selectedTime, setSelectedTime] =
    useState("all");

  const [logs, setLogs] =
    useState<LogItem[]>([]);

  const [error, setError] =
    useState("");



  /*
   * Get logs from backend
   */
  useEffect(() => {

    const getLogs = async () => {

      try {

        setError("");

        const response = await fetch(
          `${API_URL}/logs`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        console.log("LOG RESPONSE:", response.status);
        console.log("LOG DATA:", data);
        console.log("DATA.LOGS:", data.logs);

        if (!response.ok) {

          setError(
            data.error || "Unable to load logs"
          );

          return;
        }

        setLogs(data.logs ?? []);

      } catch (error) {

        console.error(
          "GET LOGS ERROR:",
          error
        );

        setError(
          "Unable to connect to server"
        );
      }

    };

    getLogs();

  }, []);



  /*
   * Filter logs
   */
  const filteredLogs = logs.filter((log) => {

    const search =
      searchText.toLowerCase();


    const matchesSearch =
      log.asset?.toLowerCase().includes(search) ||
      log.event?.toLowerCase().includes(search) ||
      log.severity?.toLowerCase().includes(search) ||
      log.action?.toLowerCase().includes(search) ||
      log.source_ip?.toLowerCase().includes(search);


    const matchesSeverity =
      selectedSeverity === "all" ||
      log.severity
        ?.toLowerCase() ===
        selectedSeverity.toLowerCase();


    const matchesAsset =
      selectedAsset === "all" ||
      log.asset
        ?.toLowerCase()
        .replace(/\s+/g, "-") ===
        selectedAsset.toLowerCase();


    const logDate =
      new Date(log.log_time);

    const now =
      new Date();

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



  /*
   * Sort logs
   */
  const sortedLogs =
    [...filteredLogs].sort((a, b) => {

      const timeA =
        new Date(a.log_time).getTime();

      const timeB =
        new Date(b.log_time).getTime();


      if (selectedSort === "newest") {
        return timeB - timeA;
      }

      return timeA - timeB;

    });



  return (

    <IonPage className="log-page">

      <IonHeader>

        <IonToolbar>

          <IonTitle className="title">
            Logs
          </IonTitle>

        </IonToolbar>

      </IonHeader>


      <IonContent>

        <div className="title-content">
          View and analyze security events and
          systems logs
        </div>


        {/* Error */}
        {error && (
          <IonText color="danger">
            <p className="ion-padding">
              {error}
            </p>
          </IonText>
        )}



        {/* Search and filters */}

        <div className="search-bar-content">

          <IonSearchbar
            className="search-bar"
            value={searchText}
            onIonInput={(e) =>
              setSearchText(
                e.detail.value ?? ""
              )
            }
          />


          <IonSelect
            className="search-bar_severities"
            placeholder="All Severities"
            value={selectedSeverity}
            onIonChange={(e) =>
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
            onIonChange={(e) =>
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

        </div>



        {/* Filter popover */}

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
              onIonChange={(e) =>
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
              onIonChange={(e) =>
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

            {/* 
              MAYBE ADD ACTION FILTER:
              ACCESSED, DENIED, BLOCKED, FLAGGED
            */}

          </IonContent>

        </IonPopover>



        {/* Logs */}

        <div className="logs-container">

          <div className="log-header">

            <p>Asset</p>

            <p>Source IP</p>

            <p>Event</p>

            <p>Severity</p>

            <p>Action</p>

            <p>Time</p>

          </div>


          {sortedLogs.map((log) => (

            <div
              key={log.log_id}
              className="log-row"
            >

              <p>
                {log.asset ?? "-"}
              </p>

              <p>
                {log.source_ip}
              </p>

              <p>
                {log.event}
              </p>

              <p>
                {log.severity}
              </p>

              <p>
                {log.action}
              </p>

              <p>
                {new Date(
                  log.log_time
                ).toLocaleString()}
              </p>

            </div>

          ))}


          {sortedLogs.length === 0 &&
            !error && (
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
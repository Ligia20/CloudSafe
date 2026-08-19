import React,{useCallback,useEffect,useState} from "react";
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import {useParams} from "react-router-dom";
//Used AI to help with cleaner css and visualization
import "./Assets.css";

interface AssetEvent{
  id:string;
  sourceIp:string|null;
  eventType:string;
  message:string;
  severity:string;
  metadata:any;
  timestamp:string;
}

interface StatusHistory {
  id:string;
  oldStatus:string;
  newStatus:string;
  changedAt:string;
}

interface CloudAsset {
  id:string;
  name:string;
  type:string;
  ipAddress:string|null;
  hostname:string|null;
  status:string;
  os:string|null;
  cpuCount:number|null;
  totalMemory:number|string|null;
  agentVersion:string|null;
  lastSeen:string|null;
  lastInventory:string|null;
  createdAt:string;
  events:AssetEvent[];
  statusHistory:StatusHistory[];
}

const API_URL="/api";

const getToken=()=>{
  return localStorage.getItem("token");
};

const handleUnauthorized=()=>{
  localStorage.removeItem("authenticated");
  localStorage.removeItem("token");
  window.location.href="/login";
};

const authHeaders=()=>{
  const token=getToken();

  return {
    Authorization:`Bearer ${token}`,
    "Content-Type":"application/json",
    "Cache-Control":"no-cache, no-store, must-revalidate",
    Pragma:"no-cache",
    Expires:"0",
  };
};

const getStatusColor=(
  status:string
):"success"|"medium"|"warning"=>{
  switch(status.toLowerCase()){
    case "active":
    case "online":
      return "success";

    case "offline":
      return "medium";

    default:
      return "warning";
  }
};

const getSeverityColor=(
  severity:string
):"success"|"warning"|"danger"|"medium"=>{
  switch(severity.toUpperCase()){
    case "CRITICAL":
      return "danger";

    case "HIGH":
      return "warning";

    case "MEDIUM":
      return "medium";

    case "LOW":
      return "success";

    default:
      return "medium";
  }
};

const formatMemory=(
  memory:number|string|null
)=>{
  if(memory===null||memory===undefined){
    return "N/A";
  }

  const gigabytes=
    Number(memory)/(1024*1024*1024);

  return `${gigabytes.toFixed(1)} GB`;
};

const formatDate=(
  date:string|null
)=>{
  if(!date){
    return "Never";
  }

  const parsedDate=new Date(date);

  if(Number.isNaN(parsedDate.getTime())){
    return "Unknown";
  }

  return parsedDate.toLocaleString();
};

const formatRelativeTime=(
  date:string|null,
  now:number
)=>{
  if(!date){
    return "Never";
  }

  const timestamp=
    new Date(date).getTime();

  if(Number.isNaN(timestamp)){
    return "Unknown";
  }

  const diff=Math.floor(
    (now-timestamp)/1000
  );

  if(diff<60){
    return "Just now";
  }

  const minutes=Math.floor(diff/60);

  if(minutes<60){
    return `${minutes} minute${minutes===1?"":"s"} ago`;
  }

  const hours=Math.floor(minutes/60);

  if(hours<24){
    return `${hours} hour${hours===1?"":"s"} ago`;
  }

  const days=Math.floor(hours/24);

  return `${days} day${days===1?"":"s"} ago`;
};

const getLastSeenStatus=(
  date:string|null,
  now:number
)=>{
  if(!date){
    return {
      label:"Never",
      color:"medium",
    };
  }

  const timestamp=
    new Date(date).getTime();

  if(Number.isNaN(timestamp)){
    return {
      label:"Unknown",
      color:"medium",
    };
  }

  const diff=
    (now-timestamp)/1000;

  if(diff<=120){
    return {
      label:"Healthy",
      color:"success",
    };
  }

  if(diff<=300){
    return {
      label:"Warning",
      color:"warning",
    };
  }

  return {
    label:"Offline",
    color:"danger",
  };
};

const normalizeDate=(
  value:unknown
):string|null=>{
  if(!value){
    return null;
  }

  const parsedDate=
    new Date(String(value));

  if(Number.isNaN(parsedDate.getTime())){
    return null;
  }

  return parsedDate.toISOString();
};

const CloudAssetDetails:React.FC=()=>{

  const {id}=useParams<{id:string}>();

  const [asset,setAsset]=
    useState<CloudAsset|null>(null);

  const [loading,setLoading]=
    useState(true);

  const [error,setError]=
    useState("");

  const [now,setNow]=
    useState(Date.now());


  const loadAsset=useCallback(
    async(initialLoad=false)=>{

      try{

        if(initialLoad){
          setLoading(true);
        }

        const token=getToken();

        if(!token){
          handleUnauthorized();
          return;
        }

        if(!id){
          setError(
            "Cloud asset ID is missing."
          );
          return;
        }

        const response=await fetch(
          `${API_URL}/v1/assets/${id}?t=${Date.now()}`,
          {
            method:"GET",
            headers:authHeaders(),
            cache:"no-store",
          }
        );


        if(response.status===401){
          handleUnauthorized();
          return;
        }


        const data=
          await response.json()
          .catch(()=>null);


        if(!response.ok){
          throw new Error(
            data?.error||
            "Failed to retrieve cloud asset"
          );
        }


        const refreshedAsset:CloudAsset={
          id:String(data.id),
          name:data.name||"",
          type:data.type||"",
          ipAddress:data.ipAddress??null,
          hostname:data.hostname??null,
          status:data.status||"unknown",
          os:data.os??null,

          cpuCount:
            data.cpuCount!==null &&
            data.cpuCount!==undefined
              ? Number(data.cpuCount)
              : null,

          totalMemory:
            data.totalMemory!==null &&
            data.totalMemory!==undefined
              ? String(data.totalMemory)
              : null,

          agentVersion:
            data.agentVersion??null,

          lastSeen:
            normalizeDate(data.lastSeen),

          lastInventory:
            normalizeDate(data.lastInventory),

          createdAt:
            data.createdAt||"",

          events:
            Array.isArray(data.events)
              ? data.events
              : [],

          statusHistory:
            Array.isArray(data.statusHistory)
              ? data.statusHistory
              : [],
        };


        console.log(
          "LAST SEEN FROM API:",
          data.lastSeen
        );

        console.log(
          "LAST SEEN NORMALIZED:",
          refreshedAsset.lastSeen
        );


        setAsset(refreshedAsset);
        setError("");

      }catch(error){

        console.error(
          "LOAD CLOUD ASSET ERROR:",
          error
        );

        if(initialLoad){
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load cloud asset"
          );
        }

      }finally{

        if(initialLoad){
          setLoading(false);
        }

      }

    },
    [id]
  );


  useEffect(()=>{

    let cancelled=false;

    const refresh=async()=>{

      if(cancelled){
        return;
      }

      await loadAsset(false);
    };


    loadAsset(true);


    const poll=
      window.setInterval(
        refresh,
        10000
      );


    const clock=
      window.setInterval(
        ()=>{
          setNow(Date.now());
        },
        5000
      );


    return()=>{

      cancelled=true;

      window.clearInterval(poll);
      window.clearInterval(clock);

    };


  },[loadAsset]);


  const visibleLastSeen=
  asset?.lastSeen
    ? formatRelativeTime(
        asset.lastSeen,
        now
      )
    : "Never";


  const lastSeenHealth=
    getLastSeenStatus(
      asset?.lastSeen||null,
      now
    );


  const exactLastSeen=
    asset?.lastSeen
      ? formatDate(asset.lastSeen)
      : "Never";


  console.log(
    "RENDER LAST SEEN:",
    visibleLastSeen,
    now
  );

    return(
    <IonPage className="assets-page">

      <IonHeader>
        <IonToolbar>

          <IonButtons slot="start">
            <IonMenuButton
              autoHide={false}
            />
          </IonButtons>

          <IonTitle>
            Cloud Asset Details
          </IonTitle>

        </IonToolbar>
      </IonHeader>


      <IonContent className="ion-padding">

        <IonButton
          fill="outline"
          routerLink="/assets"
        >
          Back to Cloud Assets
        </IonButton>


        {loading&&(
          <div className="assets-empty-state">

            <IonSpinner/>

            <p>
              Loading cloud asset...
            </p>

          </div>
        )}


        {error&&(
          <IonText color="danger">
            <p>
              {error}
            </p>
          </IonText>
        )}



        {!loading&&!error&&asset&&(
          <>

            <div className="assets-heading">

              <div>

                <h1>
                  {asset.name}
                </h1>

                <p>
                  {asset.type}
                </p>

              </div>


              <IonBadge
                color={
                  getStatusColor(
                    asset.status
                  )
                }
              >
                {asset.status}
              </IonBadge>

            </div>



            <IonCard>

              <IonCardHeader>

                <IonCardTitle>
                  Asset Information
                </IonCardTitle>

                <IonCardSubtitle>
                  CloudSafe monitoring information
                </IonCardSubtitle>

              </IonCardHeader>


              <IonCardContent>


                <div className="asset-detail-row">
                  <strong>
                    Hostname:
                  </strong>

                  <span>
                    {asset.hostname||"N/A"}
                  </span>
                </div>


                <div className="asset-detail-row">
                  <strong>
                    IP Address:
                  </strong>

                  <span>
                    {asset.ipAddress||"N/A"}
                  </span>
                </div>


                <div className="asset-detail-row">
                  <strong>
                    Operating System:
                  </strong>

                  <span>
                    {asset.os||"N/A"}
                  </span>
                </div>


                <div className="asset-detail-row">
                  <strong>
                    CPU:
                  </strong>

                  <span>
                    {asset.cpuCount!==null
                      ?`${asset.cpuCount} cores`
                      :"N/A"}
                  </span>
                </div>


                <div className="asset-detail-row">
                  <strong>
                    Memory:
                  </strong>

                  <span>
                    {formatMemory(
                      asset.totalMemory
                    )}
                  </span>
                </div>


                <div className="asset-detail-row">
                  <strong>
                    Agent Version:
                  </strong>

                  <span>
                    {asset.agentVersion||
                    "Not installed"}
                  </span>
                </div>


                <div
                  className="asset-detail-row"
                  key={`${asset.lastSeen}-${now}`}
                >

                  <strong>
                    Last Seen:
                  </strong>


                  <span
                    className="asset-last-seen updated"
                    data-last-seen={
                      asset.lastSeen||""
                    }
                    title={exactLastSeen}
                  >
                    {visibleLastSeen}
                  </span>


                  <IonBadge
                    color={
                      lastSeenHealth.color
                    }
                  >
                    {lastSeenHealth.label}
                  </IonBadge>

                </div>


                <div className="asset-detail-row">
                  <strong>
                    Last Inventory:
                  </strong>

                  <span>
                    {formatDate(
                      asset.lastInventory
                    )}
                  </span>
                </div>


                <div className="asset-detail-row">
                  <strong>
                    Enrolled:
                  </strong>

                  <span>
                    {formatDate(
                      asset.createdAt
                    )}
                  </span>
                </div>


              </IonCardContent>

            </IonCard>


            <IonCard>

              <IonCardHeader>

                <IonCardTitle>
                  Status History
                </IonCardTitle>

                <IonCardSubtitle>
                  Asset online and offline transitions
                </IonCardSubtitle>

              </IonCardHeader>


              <IonCardContent>

                {asset.statusHistory.length===0 ? (

                  <div className="assets-empty-state">

                    <h2>
                      No status history
                    </h2>

                    <p>
                      Status changes will appear here.
                    </p>

                  </div>

                ):(

                  asset.statusHistory.map(
                    (history)=>(
                      <div
                        className="asset-detail-row"
                        key={history.id}
                      >

                        <strong>
                          {history.newStatus}
                        </strong>

                        <span>
                          {formatDate(
                            history.changedAt
                          )}

                        </span>

                      </div>
                    )
                  )

                )}

              </IonCardContent>

            </IonCard>




            <IonCard>

              <IonCardHeader>

                <IonCardTitle>
                  Recent Events
                </IonCardTitle>

                <IonCardSubtitle>
                  Latest activity reported by this cloud asset
                </IonCardSubtitle>

              </IonCardHeader>



              <IonCardContent>

                {asset.events.length===0?(

                  <div className="assets-empty-state">

                    <h2>
                      No events yet
                    </h2>

                    <p>
                      Events reported by this asset will appear here.
                    </p>

                  </div>

                ):(

                  asset.events.map(
                    (event)=>(

                      <IonCard
                        key={event.id}
                      >

                        <IonCardHeader>

                          <IonCardTitle>
                            {event.eventType}
                          </IonCardTitle>

                          <IonCardSubtitle>
                            {formatDate(
                              event.timestamp
                            )}
                          </IonCardSubtitle>

                        </IonCardHeader>


                        <IonCardContent>

                          <p>
                            {event.message}
                          </p>


                          <p>

                            <strong>
                              Severity:
                            </strong>{" "}


                            <IonBadge
                              color={
                                getSeverityColor(
                                  event.severity
                                )
                              }
                            >
                              {event.severity}
                            </IonBadge>

                          </p>


                          <p>

                            <strong>
                              Source IP:
                            </strong>{" "}

                            {event.sourceIp||"N/A"}

                          </p>


                        </IonCardContent>

                      </IonCard>

                    )
                  )

                )}

              </IonCardContent>

            </IonCard>


          </>
        )}

      </IonContent>

    </IonPage>
  );

};

export default CloudAssetDetails;
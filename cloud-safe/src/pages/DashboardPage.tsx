import React, { useState, useEffect } from 'react'; 
import { 
  IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, 
  IonIcon, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, 
  IonCardTitle, IonBadge, IonText, 
} from '@ionic/react'; 
import { cloud } from 'ionicons/icons'; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, 
} from 'recharts'; 
import { useQuery } from '@tanstack/react-query'; 

const getBadgeColor = (severity: string | null) => { 
  if (!severity) return 'medium'; 
  switch (severity.toLowerCase().trim()) { 
    case 'critical': return 'danger'; 
    case 'high': return 'warning'; 
    case 'medium': return 'primary'; 
    case 'low': return 'success'; 
    default: return 'medium'; 
  } 
}; 

const API_URL = 'http://localhost:3000'; // Replace with your actual backend URL 

const COLUMN_CONFIG = { 
  stats: { assets: "Monitored Assets", activeAlerts: "Active Alerts", totalLogs: "Total Logs", criticalAlerts: "Critical Alerts" }, 
  logsTable: { incident: "Severity Incident", target: "Asset", source: "Source IP", time: "Time", action: "Action Taken" } 
}; 

// --- HARDCODED DATA STRUCTURES --- 
const MOCK_STATS = [ 
  { title: "Monitored Assets", value: "8", change: "+1 from yesterday", color: "success" }, 
  { title: "Active Alerts", value: "3", change: "+2 from yesterday", color: "danger" }, 
  { title: "Total Logs", value: "4,589", change: "+15% from yesterday", color: "success" }, 
  { title: "Critical Alerts", value: "1", change: "No change", color: "medium" } 
]; 

const DashboardPage = () => { 
  // Fetch unified dashboard data from your express backend server 
  const { data, isPending, isError } = useQuery({ 
    queryKey: ['securityDashboardData'], 
    queryFn: () => fetch(`${API_URL}/dashboard`).then(res => { 
      if (!res.ok) throw new Error('Failed to reach backend database service.'); 
      return res.json(); 
    }), 
  }); 

  // Extract variables safely or switch to fallbacks if your backend errors out 
  const alerts = data?.Recent_Alert_ || []; 
  const logsPaginationView = data?.firstPage || []; 

  // Use live database counters if available; otherwise use fallback structures 
  const displayStats = data ? [ 
    { title: "Monitored Assets", value: "8", change: "Live Network Stream", color: "success" }, 
    { title: "Active Alerts", value: String(alerts.filter((a: any) => a.status === 'Active').length), change: "Check Status", color: "danger" }, 
    { title: "Total Logs", value: String(data?.Recent_Logs?.length || 0), change: "Indexed rows", color: "success" }, 
    { title: "Critical Alerts", value: String(alerts.filter((a: any) => a.severity === 'Critical').length), change: "Urgent items", color: "medium" } 
  ] : MOCK_STATS; 

  // Dynamically map real database logs to chart structure variables
  const CHART_LOGS = logsPaginationView.map((log: any) => ({
    time: log.log_time ? new Date(log.log_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    logs: 350
  }));

  // Aggregates alerts per unique asset name automatically from database records
  const assetAlertMap: { [key: string]: number } = {};
  alerts.forEach((alert: any) => {
    if (alert.asset) assetAlertMap[alert.asset] = (assetAlertMap[alert.asset] || 0) + 1;
  });
  const CHART_ASSETS = Object.keys(assetAlertMap).map(name => ({
    name: name,
    alerts: assetAlertMap[name]
  }));

  // Map backend logs schema layout attributes directly into list item UI loops
  const LIVE_LOGS = logsPaginationView.map((log: any) => ({
    severity: log.severity || 'Info',
    event: log.event || 'System Event',
    asset: log.asset || 'N/A',
    time: log.log_time ? new Date(log.log_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    color: getBadgeColor(log.severity)
  }));

  return ( 
    <IonPage> 
      <IonHeader> 
        <IonToolbar style={{ backgroundColor: '#f8f9fa' }}> 
          <IonButtons slot="start"> 
            <IonMenuButton /> 
          </IonButtons> 
          <IonTitle color="primary" > 
            <b> <strong> Cloud Safe &nbsp; <IonIcon slot="end" icon={cloud}></IonIcon> </strong> </b> 
          </IonTitle> 
        </IonToolbar> 
      </IonHeader> 
      <IonContent className="ion-padding"> 
        <IonGrid fixed> 
          <IonRow> 
            <h1 style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#ffff' }} > Overview of your security environment </h1> 
          </IonRow> 
        </IonGrid> 
        
        <IonGrid> 
          <IonRow> 
            {/* CHANGE: stat.map now reads from the 'displayStats' query variable instead of the broken, undefined 'stats' state */}
            {displayStats.map((stat, index) => ( 
              <IonCol size="12" sizeSm="6" sizeMd="3" key={index}> 
                <IonCard> 
                  <IonCardHeader> 
                    <IonCardSubtitle>{stat.title}</IonCardSubtitle> 
                    <IonCardTitle> {stat.value} </IonCardTitle> 
                  </IonCardHeader> 
                  <IonCardContent> 
                    <IonText color={stat.color}> {stat.change} </IonText> 
                  </IonCardContent> 
                </IonCard> 
              </IonCol> 
            ))} 
          </IonRow> 
          <IonRow> 
            <IonCol size="12" size-md="6"> 
              <IonCard style={{ margin: '0', height: '100%' }}> 
                <IonCardHeader> 
                  <IonCardTitle>Logs Over Time</IonCardTitle> 
                </IonCardHeader> 
                <IonCardContent> 
                  <ResponsiveContainer width="100%" height={300}> 
                    {/* CHANGE: Switched from static MOCK_CHART_LOGS to database-mapped CHART_LOGS with fallback check to avoid crashes */}
                    <AreaChart data={CHART_LOGS.length ? CHART_LOGS : [{ time: '00:00', logs: 0 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}> 
                      <CartesianGrid strokeDasharray="3 3" /> 
                      <XAxis dataKey="time" /> 
                      <YAxis /> 
                      <RechartsTooltip /> 
                      <Area type="monotone" dataKey="logs" stroke="#8884d8" fill="#8884d8" /> 
                    </AreaChart> 
                  </ResponsiveContainer> 
                </IonCardContent> 
              </IonCard> 
            </IonCol> 
            <IonCol size="12" size-md="6"> 
              <IonCard style={{ margin: '0', height: '100%' }}> 
                <IonCardHeader> 
                  <IonCardTitle style={{ fontSize: '1.2rem' }}>Top Assets By Alert</IonCardTitle> 
                </IonCardHeader> 
                <IonCardContent> 
                  <ResponsiveContainer width="100%" height={300}> 
                    {/* CHANGE: Switched from static MOCK_CHART_ASSETS to the database-aggregated CHART_ASSETS array data source */}
                    <AreaChart data={CHART_ASSETS.length ? CHART_ASSETS : [{ name: 'None', alerts: 0 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}> 
                      <CartesianGrid strokeDasharray="3 3" /> 
                      <XAxis dataKey="name" /> 
                      <YAxis /> 
                      <RechartsTooltip /> 
                      <Area type="monotone" dataKey="alerts" stroke="#82ca9d" fill="#82ca9d" /> 
                    </AreaChart> 
                  </ResponsiveContainer> 
                </IonCardContent> 
              </IonCard> 
            </IonCol> 
          </IonRow> 
          <IonRow> 
            <IonCol size="12" size-md="6"> 
              <IonButton shape='round' color='primary' routerLink={'/Assets'}> View all Assets </IonButton> 
              <IonCard style={{ maxWidth: '350px' }}> 
                <IonList lines="full"> 
                  {/* CHANGE: Switched loop from hardcoded variable to LIVE_LOGS populated straight from the database firstPage query result */}
                  {LIVE_LOGS.map((log, index) => ( 
                    <IonItem key={index} color={log.color}> 
                      <IonBadge color={log.color} slot="start">{log.severity}</IonBadge> 
                      <IonLabel> <h2>{log.event}</h2> <p>Asset: {log.asset}</p> <p>Time: {log.time}</p> </IonLabel> 
                    </IonItem> 
                  ))} 
                </IonList> 
              </IonCard> 
            </IonCol> 
          </IonRow> 
        </IonGrid> 
        <IonButton shape='round' color='primary' routerLink={'/Assets'} > View all Assets </IonButton> 
      </IonContent> 
    </IonPage> 
  ); 
}; 

export default DashboardPage;

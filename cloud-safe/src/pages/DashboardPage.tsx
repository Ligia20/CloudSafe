import React, { useState, useEffect } from 'react'; 
import { 
  IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, 
  IonIcon, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, 
  IonCardTitle, IonBadge, IonText, 
} from '@ionic/react'; 
import { bug, cloud, globe, lockClosed, person } from 'ionicons/icons'; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'; 
import { useQuery, QueryClientProvider, QueryClient } from '@tanstack/react-query'; 

const queryClient = new QueryClient(); 

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

const API_URL = 'http://localhost:3000'; 

// --- HARDCODED DATA STRUCTURES --- 
const MOCK_STATS = [ 
  { title: "Monitored Assets", value: "8", change: "+1 from yesterday", color: "success" }, 
  { title: "Active Alerts", value: "3", change: "+2 from yesterday", color: "danger" }, 
  { title: "Total Logs", value: "4,589", change: "+15% from yesterday", color: "success" }, 
  { title: "Critical Alerts", value: "1", change: "No change", color: "medium" } 
]; 

const MOCK_LOGS = [ 
  { severity: 'Critical', event: 'Brute Force Attack', asset: 'Web Server', time: '10:32 AM', color: 'danger' }, 
  { severity: 'High', event: 'Port Scan Detected', asset: 'Web Server', time: '10:28 AM', color: 'warning' }, 
  { severity: 'Medium', event: 'Multiple Failed Logins', asset: 'DB Server', time: '10:17 AM', color: 'primary' } 
]; 

const MOCK_CHART_LOGS = [ 
  { time: '12 AM', logs: 400 }, { time: '4 AM', logs: 300 }, { time: '8 AM', logs: 900 }, 
  { time: '12 PM', logs: 1400 }, { time: '4 PM', logs: 1100 }, { time: '8 PM', logs: 1600 } 
]; 

const MOCK_CHART_ASSETS = [ 
  { name: 'Web Server', alerts: 12 }, { name: 'DB Server', alerts: 7 }, 
  { name: 'VPN Gateway', alerts: 5 }, { name: 'File Server', alerts: 2 } 
];

// ==========================================
// FIX 1: Renamed this to DashboardContent. 
// It safely holds useQuery because it runs UNDER the Provider now.
// ==========================================
const DashboardContent = () => { 
  const { data, isError } = useQuery({ 
    queryKey: ['securityDashboardData'], 
    queryFn: () => fetch(`${API_URL}/dashboard`).then(res => { 
      if (!res.ok) throw new Error('Failed to reach backend database service.'); 
      return res.json(); 
    }), 
    retry: false
  }); 

  const alerts = data?.Recent_Alert_ || []; 
  const logsPaginationView = data?.firstPage || []; 

  const displayStats = data ? [ 
    { title: "Monitored Assets", value: "8", change: "Live Network Stream", color: "success" }, 
    { title: "Active Alerts", value: String(alerts.filter((a: any) => a.status === 'Active').length), change: "Check Status", color: "danger" }, 
    { title: "Total Logs", value: String(data?.Recent_Logs?.length || 0), change: "Indexed rows", color: "success" }, 
    { title: "Critical Alerts", value: String(alerts.filter((a: any) => a.severity === 'Critical').length), change: "Urgent items", color: "medium" } 
  ] : MOCK_STATS; 

  const CHART_LOGS = data && logsPaginationView.length ? logsPaginationView.map((log: any) => ({ 
    time: log.log_time ? new Date(log.log_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A', 
    logs: 350 
  })) : MOCK_CHART_LOGS; 

  const assetAlertMap: { [key: string]: number } = {}; 
  alerts.forEach((alert: any) => { 
    if (alert.asset) assetAlertMap[alert.asset] = (assetAlertMap[alert.asset] || 0) + 1; 
  }); 
  
  const CHART_ASSETS = data && Object.keys(assetAlertMap).length ? Object.keys(assetAlertMap).map(name => ({ 
    name: name, 
    alerts: assetAlertMap[name] 
  })) : MOCK_CHART_ASSETS; 

  const LIVE_LOGS = data && logsPaginationView.length ? logsPaginationView.map((log: any) => ({ 
    severity: log.severity || 'Info', 
    event: log.event || 'System Event', 
    asset: log.asset || 'N/A', 
    time: log.log_time ? new Date(log.log_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A', 
    color: getBadgeColor(log.severity) 
  })) : MOCK_LOGS; 

  return ( 
    <IonPage> 
      <IonHeader> 
        <IonToolbar style={{ backgroundColor: '#f8f9fa' }}> 
          <IonButtons slot="start"> 
            <IonMenuButton /> 
          </IonButtons> 
          <IonTitle color="primary" style={{ fontSize: '3rem' }}>
            <b> <strong> Cloud Safe &nbsp; <IonIcon slot="end" icon={cloud}></IonIcon> </strong> </b> 
          </IonTitle> 
        </IonToolbar> 
      </IonHeader> 
      <IonContent className="ion-padding"> 
          <IonRow> 
            <h1 style={{ color: '#4370e0', fontWeight: 'bold', margin: '30 30 20px 0' }} > &nbsp; Overview of your Security Environment </h1> 
          </IonRow>    
        {isError && (
          <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Local Sandbox Mode Active:</strong> Backend API server unreachable. Displaying fallback mock records.
          </div>
        )}

        <IonGrid> 
          <IonRow> 
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
                    <AreaChart data={CHART_LOGS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}> 
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
                    <AreaChart data={CHART_ASSETS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}> 
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
              <IonButton shape='round' color='primary' routerLink={'/Assets'}> View all logs </IonButton> 
              <IonCard style={{ maxWidth: '350px' }}> 
                <IonList lines="full"> 
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
          
          <IonRow>
            <h1 style={{ color: '#4370e0', fontWeight: 'bold', margin: '30 30 20px 0' }} >
              &nbsp; Attack Simulator &nbsp;
            </h1>
          </IonRow>
            <IonGrid> 
              <IonRow> 
                  <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard> 
                      <IonCardHeader> 
                          <IonCardTitle className="ion-display-flex ion-align-items-center" >  
                            Brute Force  &nbsp;
                              <IonIcon  icon={lockClosed} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                      <IonCardSubtitle>
                      </IonCardSubtitle>
                  </IonCard> 
                  </IonCol> 
                   <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard> 
                      <IonCardHeader> 
                          <IonCardTitle> 
                            Port Scan &nbsp;
                            <IonIcon  icon={globe} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                  </IonCard> 
                  </IonCol> 
                   <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard> 
                      <IonCardHeader> 
                          <IonCardTitle> 
                            Malware &nbsp;
                              <IonIcon  icon={bug} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                  </IonCard> 
                  </IonCol> 
                   <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard> 
                      <IonCardHeader> 
                          <IonCardTitle> 
                            Unauthorized Acccess &nbsp;
                              <IonIcon  icon={person} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                  </IonCard> 
                  </IonCol> 
                </IonRow> 
            </IonGrid>

        </IonGrid> 
      </IonContent> 
    </IonPage> 
  ); 
}; 

// ==========================================
// FIX 2: This is what App Router links to.
// It wraps the provider on the outside BEFORE the hooks run!
// ==========================================
const DashboardPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default DashboardPage;

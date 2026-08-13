import React, { useState, useEffect } from 'react'; 
import { 
  IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, 
  IonIcon, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, 
  IonCardTitle, IonBadge, IonText, 
} from '@ionic/react'; 
import { bug, cloud, globe, lockClosed, person } from 'ionicons/icons'; 
import { 
  BarChart, Bar,  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'; 
import { useQuery, QueryClientProvider, QueryClient } from '@tanstack/react-query'; 
import './DashboardPage.css';

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

const MOCK_ALERTS_PANEL = [
  { severity: 'Critical', name: 'Brute Force Attack', asset: 'Web Server', time: '10:32 AM', status: 'Open', color: 'danger' },
  { severity: 'High', name: 'Port Scan Detected', asset: 'Web Server', time: '10:28 AM', status: 'Investigating', color: 'warning' },
  { severity: 'Medium', name: 'Multiple Failed Logins', asset: 'Database Server', time: '10:17 AM', status: 'Open', color: 'primary' }
];

const MOCK_LOGS_PANEL = [
  { time: '10:32:15 AM', asset: 'Web Server', ip: '82.15.22.4', event: 'Failed SSH Login', severity: 'High', action: 'Denied', color: 'warning' },
  { time: '10:31:48 AM', asset: 'Database Server', ip: '192.168.1.55', event: 'SQL Login Success', severity: 'Low', action: 'Allowed', color: 'success' },
  { time: '10:31:10 AM', asset: 'Firewall', ip: '203.0.113.10', event: 'Blocked Connection', severity: 'Medium', action: 'Denied', color: 'primary' }
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


    const VISUAL_ALERTS = data && alerts.length ? alerts.map((alert: any) => ({ 
    severity: alert.severity || 'Info', 
    name: alert.alert_name_ || 'Unknown Threat', 
    asset: alert.asset || 'N/A', 
    time: alert.alert_time ? new Date(alert.alert_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A', 
    status: alert.status || 'Open', 
    color: getBadgeColor(alert.severity) 
  })) : MOCK_ALERTS_PANEL; 

  const VISUAL_LOGS = data && logsPaginationView.length ? logsPaginationView.map((log: any) => ({ 
    time: log.log_time ? new Date(log.log_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A', 
    asset: log.asset || 'N/A', 
    ip: log.source_ip || '0.0.0.0', 
    event: log.event || 'System Activity', 
    severity: log.severity || 'Low', 
    action: log.action || 'Logged', 
    color: getBadgeColor(log.severity) 
  })) : MOCK_LOGS_PANEL; 


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
        <IonToolbar className="theme-header"> 
          <IonButtons slot="start"> 
            <IonMenuButton className="theme-menu-btn" /> 
          </IonButtons> 
          <IonTitle className="theme-title">
            <b> <strong> Cloud Safe &nbsp; <IonIcon slot="end" icon={cloud}></IonIcon> </strong> </b> 
          </IonTitle> 
        </IonToolbar> 
      </IonHeader> 

      <IonContent className="ion-padding theme-content"> 
          <IonRow> 
            <h1 className="theme-heading" > &nbsp; Overview of your Security Environment </h1> 
          </IonRow>    
        {isError && (
          <div className="theme-error-banner">
            <strong>Local Sandbox Mode Active:</strong> Backend API server unreachable. Displaying fallback mock records.
          </div>
        )}

        <IonGrid> 
          <IonRow> 
            {displayStats.map((stat, index) => ( 
              <IonCol size="12" sizeSm="6" sizeMd="3" key={index}> 
                <IonCard className="theme-card" > 
                  <IonCardHeader> 
                    <IonCardSubtitle className="theme-subtitle">{stat.title}</IonCardSubtitle> 
                    <IonCardTitle className="theme-card-title"> {stat.value} </IonCardTitle> 
                  </IonCardHeader> 
                  <IonCardContent> 
                    <IonText color={stat.color}> {stat.change} </IonText> 
                  </IonCardContent> 
                </IonCard> 
              </IonCol> 
            ))} 
          </IonRow> 
          <IonRow> 
            
            <IonCol size="12" sizeMd="6"> 
              <IonCard className="theme-card" style={{ margin: '0', height: '100%' }}> 
                <IonCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                  <IonCardTitle className="theme-card-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Recent Alerts</IonCardTitle> 
                  <IonButton fill="clear" size="small" routerLink="/Alerts">View all</IonButton> 
                </IonCardHeader> 
                <IonList lines="full" style={{ background: 'transparent' }}> 
                  {VISUAL_ALERTS.slice(0, 4).map((alert, index) => ( 
                    <IonItem key={index} lines="full" style={{ '--background': 'transparent' }}> 
                      <IonBadge color={alert.color} slot="start">{alert.severity}</IonBadge> 
                      <IonLabel> 
                        <h2 style={{ fontWeight: '600' }}>{alert.name}</h2> 
                        <p>Asset: {alert.asset} | Time: {alert.time}</p> 
                      </IonLabel> 
                      <IonBadge color="light" slot="end" style={{ color: '#8c9fe4' }}>{alert.status}</IonBadge> 
                    </IonItem> 
                  ))} 
                </IonList> 
              </IonCard> 
            </IonCol> 
            
          

            <IonCol size="12" sizeMd="6">
  <IonCard className="theme-card" style={{ margin: '0', height: '100%' }}>
    <IonCardHeader>
      <IonCardTitle style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Top Assets By Alert</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <ResponsiveContainer width="100%" height={300}>
        {/* CHANGED: Switched to BarChart and added margin helpers */}
        <BarChart 
          data={CHART_ASSETS.length ? CHART_ASSETS : [{ name: 'None', alerts: 0 }]} 
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          {/* CHANGED: Replaced Area component with Bar component using a clean theme hex color */}
          <Bar dataKey="alerts" fill="#eb445a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </IonCardContent>
  </IonCard>
</IonCol>
          </IonRow>   
              
              
              <IonCard className="theme-card chart-card" > 
                <IonCardHeader> 
                  <IonCardTitle className="theme-card-title">Logs Over Time</IonCardTitle> 
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
            
              <IonCard className="theme-card" style={{ margin: '0' }}> 
                <IonCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                  <IonCardTitle className="theme-card-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Recent Logs</IonCardTitle> 
                    <IonButton fill="clear" size="small" routerLink="/Log">View all</IonButton> 
                </IonCardHeader> 
                  <IonList lines="full" style={{ background: 'transparent' }}> 
        
                  {/* HEADER ROW: Adds structural titles over each column just like your dashboard layout image */}
                    <IonItem style={{ '--background': 'rgba(0,0,0,0.02)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      <IonGrid fixed style={{ padding: '0' }}>
                        <IonRow className="ion-align-items-center">
                          <IonCol size="2"><IonText style={{ color: '#666' }}>Time</IonText></IonCol>
                          <IonCol size="3"><IonText style={{ color: '#666' }}>Event</IonText></IonCol>
                          <IonCol size="2.5"><IonText style={{ color: '#666' }}>Asset Name</IonText></IonCol>
                          <IonCol size="2.5"><IonText style={{ color: '#666' }}>Source IP</IonText></IonCol>
                          <IonCol size="2" style={{ textAlign: 'right' }}><IonText style={{ color: '#666' }}>Action</IonText></IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonItem>

                    {/* REWRITTEN SLICE LOOP: Organizes each log row dynamically into aligned layout blocks */}
                    {VISUAL_LOGS.slice(0, 5).map((log, index) => ( 
                    <IonItem key={index} style={{ '--background': 'transparent' }}> 
                    <IonGrid fixed style={{ padding: '0' }}>
                      <IonRow className="ion-align-items-center" style={{ fontSize: '0.9rem' }}>
                
                        {/* 1. Time Column */}
                        <IonCol size="2">
                          <IonText style={{ color: '#888' }}>{log.time}</IonText>
                        </IonCol>

                {/* 2. Event Title Column */}
                <IonCol size="3">
                  <IonText style={{ fontWeight: '600' }}>{log.event}</IonText>
                </IonCol>

                {/* 3. Target Asset System Column */}
                <IonCol size="2.5">
                  <IonText>{log.asset}</IonText>
                </IonCol>

                {/* 4. Network Source IP Address Codeblock Column */}
                <IonCol size="2.5">
                  <code style={{ background: 'rgba(142, 166, 227, 0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {log.ip}
                  </code>
                </IonCol>

                {/* 5. SIEM Response Action Status Badge Column */}
                <IonCol size="2" style={{ textAlign: 'right' }}>
                  <IonBadge color={log.color}>{log.action}</IonBadge>
                </IonCol>

              </IonRow>
            </IonGrid>
          </IonItem> 
        ))} 

      </IonList> 
    </IonCard> 




          

          <IonRow>

            <h1 className="theme-heading simulator-heading">
              &nbsp; Attack Simulator &nbsp;
            </h1>
          </IonRow>

            <IonGrid> 

              <IonRow> 
                  <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard className="theme-card simulator-card"> 
                      <IonCardHeader> 
                          <IonCardTitle className="theme-card-titleion-display-flex ion-align-items-center" >  
                            Brute Force  &nbsp;
                              <IonIcon  icon={lockClosed} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                      <IonCardSubtitle>
                      </IonCardSubtitle>
                  </IonCard> 
                  </IonCol> 

                   <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard  className="theme-card simulator-card" > 
                      <IonCardHeader> 
                          <IonCardTitle> 
                            Port Scan &nbsp;
                            <IonIcon  icon={globe} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                  </IonCard> 
                  </IonCol> 

                   <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard  className="theme-card simulator-card" > 
                      <IonCardHeader> 
                          <IonCardTitle> 
                            Malware &nbsp;
                              <IonIcon  icon={bug} ></IonIcon>
                          </IonCardTitle> 
                      </IonCardHeader> 
                  </IonCard> 
                  </IonCol> 
                   <IonCol size="12" sizeSm="6" sizeMd="3" > 
                   <IonCard  className="theme-card simulator-card" > 
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

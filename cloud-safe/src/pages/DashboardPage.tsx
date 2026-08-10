import React, { useState, useEffect } from 'react';
import { 
  IonButton, 
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonMenuButton, 
  IonPage, 
  IonIcon, 
  IonTitle, 
  IonToolbar, 
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCardTitle,
  IonBadge,
} from '@ionic/react';
import { cloud } from 'ionicons/icons';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

const COLUMN_CONFIG = {
  stats: {
    assets: "Monitored Assets",
    activeAlerts: "Active Alerts",
    totalLogs: "Total Logs",
    criticalAlerts: "Critical Alerts"
  },
    logsTable: {
      incident: "Severity Incident",
      target: "Asset",
      source: "Source IP",
      time: "Time",
      action: "Action Taken"
  }
};

// --- HARDCODED DATA STRUCTURES ---
const MOCK_STATS = [
  { title: "Monitored Assets", value: "8", change: "+1 from yesterday", color: "success" },
  { title: "Active Alerts", value: "3", change: "+2 from yesterday", color: "danger" },
  { title: "Total Logs", value: "4,589", change: "+15% from yesterday", color: "success" },
  { title: "Critical Alerts", value: "1", change: "No change", color: "medium" }
];

const MOCK_LOGS = [
  { severity: 'Critical', event: 'Brute Force Attack', asset: 'Web Server', time: '10:32 AM', sourceIp: '192.168.1.50', action: 'Blocked', color: 'danger' },
  { severity: 'High', event: 'Port Scan Detected', asset: 'Web Server', time: '10:28 AM', sourceIp: '185.220.101.4', action: 'Logged', color: 'warning' },
  { severity: 'Medium', event: 'Multiple Failed Logins', asset: 'DB Server', time: '10:17 AM', sourceIp: '10.0.0.12', action: 'Flagged', color: 'primary' }
];

const MOCK_CHART_LOGS = [
  { time: '12 AM', logs: 400 },
  { time: '4 AM',  logs: 300 },
  { time: '8 AM',  logs: 900 },
  { time: '12 PM', logs: 1400 },
  { time: '4 PM',  logs: 1100 },
  { time: '8 PM',  logs: 1600 },
  { time: '12 AM', logs: 1200 },
];

const MOCK_CHART_ASSETS = [
  { name: 'Web Server', alerts: 12, color: '#eb445a' },
  { name: 'DB Server', alerts: 7, color: '#f4a943' },
  { name: 'VPN Gateway', alerts: 5, color: '#ffd534' },
  { name: 'File Server', alerts: 2, color: '#2dd36f' },
];

//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DashboardPage = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle 
            color="primary"
          >
            <b>
            <strong>
               Cloud Safe  &nbsp;
              <IonIcon slot="end" icon={cloud}></IonIcon>
            </strong>
            </b>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Put your dashboard content, buttons, or charts here */}
        <IonGrid>
          <IonRow>
            <IonCol>
              <h1>Dashboard</h1>
              <p>Overview of your security environment</p>
            </IonCol>
          </IonRow>

          <IonRow>
            {MOCK_STATS.map((stat, index) => (
              <IonCol size="12" size-md="6" size-lg="3" key={index}>
                <IonCard color={stat.color}>
                  <IonCardHeader>
                    <IonTitle>{stat.title}</IonTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h2>{stat.value}</h2>
                    <p>{stat.change}</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>

          <IonRow>
            <IonCol size="12" size-md="6">
              <IonCard style={{ marigin: '0',height: '100%' }}>
                <IonCardHeader>
                  <IonCardTitle>Logs Over Time</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={MOCK_CHART_LOGS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <IonCard style={{ marigin: '0',height: '100%' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontsize: '1.2rem' }}>Top Assets By Alert</IonCardTitle>
                </IonCardHeader>
                <IonCardContent> 
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={MOCK_CHART_ASSETS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <IonButton shape='round' color='primary' routerLink={'/Assets'}>
                View all Assets
              </IonButton>
              <IonCard style={{ maxWidth: '350px' }}>
                <IonList lines="full">
                  {MOCK_LOGS.map((log, index) => (
                    <IonItem key={index} color={log.color}>
                      <IonBadge color={log.color} slot="start">{log.severity}</IonBadge>
                      <IonLabel>
                        <h2>{log.event}</h2>
                        <p>Asset: {log.asset}</p>
                        <p>Time: {log.time}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonCard>
            <IonCardHeader>
              <IonTitle> Security Overview</IonTitle>
              <IonCardSubtitle> Card subtitle </IonCardSubtitle>
              <IonCardContent>
                Here is a small test description of the card content!
              </IonCardContent>
            </IonCardHeader>
          </IonCard>
                    <IonCard
            style={{ maxWidth: '350px' }}
          >
            <IonCardHeader>
              <IonTitle> Security Overview</IonTitle>
              <IonCardSubtitle> Card subtitle </IonCardSubtitle>
              <IonCardContent>
                Here is a small test description of the card content!
              </IonCardContent>
            </IonCardHeader>
          </IonCard>
        
          <IonList>
            <IonItem>
              <IonLabel>Pokémon Yellow</IonLabel>
            </IonItem>
          <IonItem>
            <IonLabel>Mega Man X</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>The Legend of Zelda</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Pac-Man</IonLabel>
          </IonItem>
      </IonList>
    
          <IonButton
            shape='round'
            color='primary'
            routerLink={'/Assets'}
          >
            View all Assets
          </IonButton>
          <IonList>
            <IonItem>
              <IonLabel>
                <h2>Recent Logs</h2>
                <p>Time</p>
                <p>Asset</p>
                <p>SourceIP</p>
                <p>Event</p>
                <p>Severity</p>
                <p>Action</p>
              </IonLabel>
            </IonItem>
          </IonList>
      </IonContent>

    </IonPage>
  );
};

export default DashboardPage;

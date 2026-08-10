import {
 IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonSelect, IonSelectOption, IonButton, IonPopover} from '@ionic/react';
 import React, { useEffect, useState } from 'react';


const Log: React.FC = () => {
const [searchText, setSearchText] = useState("");
const [selectedSeverity, setSelectedSeverity] = useState('all');
const [selectedAsset, setSelectedAsset] = useState('all');
const [selectedSort, setSelectedSort] = useState('newest');
const [isOpen, setIsOpen] = useState(false);
const [selectedTime, setSelectedTime] = useState('all');
// const [logs, setLogs] = useState([]);

    useEffect(() => {
            const getLogs = async () => {
                const response = await fetch ('API ROUTE');
                const data = await response.json();
                setLogs(data);

            };
            getLogs();
         }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logs</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>View and analyze security events and systems logs</IonContent>

      <IonContent>
        <IonSearchbar
        //debounce = {} needs to be installed 
            value={searchText}
            onIonInput={e => setSearchText(e.detail.value!)} >
        

        <IonSelect placeholder='All Severities'
          value={selectedSeverity}
          onIonChange={e => setSelectedSeverity(e.detail.value)}>
          <IonSelectOption value='all'>All Severities</IonSelectOption>
          <IonSelectOption value='critical'>Critical </IonSelectOption>
          <IonSelectOption value='high'>High</IonSelectOption>
          <IonSelectOption value='medium'>Medium</IonSelectOption>
          <IonSelectOption value='low'>Low</IonSelectOption>
          <IonSelectOption value='info'>Informational</IonSelectOption>
        </IonSelect>

        <IonSelect placeholder='All Assets'
          value={selectedAsset}
          onIonChange={e => setSelectedAsset(e.detail.value)}>
          <IonSelectOption value='all'>All Assets</IonSelectOption>
          <IonSelectOption value='web-server'>Web Server </IonSelectOption>
          <IonSelectOption value='database-server'>Database Server</IonSelectOption>
          <IonSelectOption value='firewall'>Firewall</IonSelectOption>
          <IonSelectOption value='vpn-gateway'>VPN Gateway</IonSelectOption>
          <IonSelectOption value='mail-server'>Mail Server</IonSelectOption>
        </IonSelect> 
            {/*LATER PULL FROM DATABASE*/}




        <IonButton onClick={() => setIsOpen(true)}>Filter</IonButton>
        <IonPopover
          isOpen={isOpen}
          onDidDismiss={() => setIsOpen(false)}
        >

              <IonSelect placeholder='sort by'
                value={selectedSort}
                onIonChange={e => setSelectedSort(e.detail.value)}>
                  <IonSelectOption value='newest'>Newest</IonSelectOption>
                  <IonSelectOption value='oldest'>Oldest</IonSelectOption>
              </IonSelect>

              <IonSelect placeholder='time range'
                value={selectedTime}
                onIonChange={e => setSelectedTime(e.detail.value)}>
                  <IonSelectOption value='all'>All time </IonSelectOption>
                  <IonSelectOption value='24hrs'>Last 24 hours</IonSelectOption>
                  <IonSelectOption value='7days'>Last 7 days</IonSelectOption>
                  <IonSelectOption value='30days'>Last 30 days</IonSelectOption>
              </IonSelect>

            {/*MAYBE ADD ACTION FILTER ACCESSED,DENIED, BLOCKED, FLAGGED*/}

         
            </IonPopover>


        </IonSearchbar>
      </IonContent>
    </IonPage>
    

  );
};




export default Log;
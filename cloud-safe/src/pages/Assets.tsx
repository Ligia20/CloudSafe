import { useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import './Assets.css';

type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
type AssetStatus = 'Online' | 'Offline';

interface Asset {
  id: number;
  name: string;
  type: string;
  ipAddress: string;
  severity: Severity;
  status: AssetStatus;
}

const emptyForm = {
  name: '',
  type: '',
  ipAddress: '',
  severity: 'Low' as Severity,
  status: 'Online' as AssetStatus,
};

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const addAsset = () => {
    if (!form.name.trim() || !form.type.trim() || !form.ipAddress.trim()) {
      return;
    }

    const newAsset: Asset = {
      id: Date.now(),
      ...form,
    };

    setAssets((currentAssets) => [...currentAssets, newAsset]);
    setForm(emptyForm);
    setIsModalOpen(false);
  };

  const deleteAsset = (assetId: number) => {
    setAssets((currentAssets) =>
      currentAssets.filter((asset) => asset.id !== assetId),
    );
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'tertiary';
      default:
        return 'success';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assets</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="assets-heading">
          <div>
            <h1>Monitored Assets</h1>
            <p>Manage the cloud resources monitored by CloudSafe.</p>
          </div>

          <IonButton onClick={() => setIsModalOpen(true)}>
            Add Asset
          </IonButton>
        </div>

        {assets.length === 0 ? (
          <div className="assets-empty-state">
            <h2>No assets found</h2>
            <p>Register your first asset to begin monitoring it.</p>

            <IonButton onClick={() => setIsModalOpen(true)}>
              Add Asset
            </IonButton>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {assets.map((asset) => (
                <IonCol size="12" sizeMd="6" sizeLg="4" key={asset.id}>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>{asset.name}</IonCardTitle>
                      <IonCardSubtitle>{asset.type}</IonCardSubtitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <p>
                        <strong>IP Address:</strong> {asset.ipAddress}
                      </p>

                      <p>
                        <strong>Severity:</strong>{' '}
                        <IonBadge color={getSeverityColor(asset.severity)}>
                          {asset.severity}
                        </IonBadge>
                      </p>

                      <p>
                        <strong>Status:</strong>{' '}
                        <IonBadge
                          color={
                            asset.status === 'Online' ? 'success' : 'medium'
                          }
                        >
                          {asset.status}
                        </IonBadge>
                      </p>

                      <IonButton size="small" disabled>
                        Edit
                      </IonButton>

                      <IonButton
                        size="small"
                        color="danger"
                        fill="outline"
                        onClick={() => deleteAsset(asset.id)}
                      >
                        Delete
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => setIsModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add Asset</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <IonItem>
              <IonInput
                label="Asset name"
                labelPlacement="stacked"
                placeholder="Production Web Server"
                value={form.name}
                onIonInput={(event) =>
                  setForm({
                    ...form,
                    name: event.detail.value ?? '',
                  })
                }
              />
            </IonItem>

            <IonItem>
              <IonInput
                label="Asset type"
                labelPlacement="stacked"
                placeholder="Azure Virtual Machine"
                value={form.type}
                onIonInput={(event) =>
                  setForm({
                    ...form,
                    type: event.detail.value ?? '',
                  })
                }
              />
            </IonItem>

            <IonItem>
              <IonInput
                label="IP address"
                labelPlacement="stacked"
                placeholder="20.51.11.2"
                value={form.ipAddress}
                onIonInput={(event) =>
                  setForm({
                    ...form,
                    ipAddress: event.detail.value ?? '',
                  })
                }
              />
            </IonItem>

            <IonItem>
              <IonSelect
                label="Severity"
                labelPlacement="stacked"
                value={form.severity}
                onIonChange={(event) =>
                  setForm({
                    ...form,
                    severity: event.detail.value as Severity,
                  })
                }
              >
                <IonSelectOption value="Low">Low</IonSelectOption>
                <IonSelectOption value="Medium">Medium</IonSelectOption>
                <IonSelectOption value="High">High</IonSelectOption>
                <IonSelectOption value="Critical">Critical</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonSelect
                label="Status"
                labelPlacement="stacked"
                value={form.status}
                onIonChange={(event) =>
                  setForm({
                    ...form,
                    status: event.detail.value as AssetStatus,
                  })
                }
              >
                <IonSelectOption value="Online">Online</IonSelectOption>
                <IonSelectOption value="Offline">Offline</IonSelectOption>
              </IonSelect>
            </IonItem>

            <div className="asset-form-actions">
              <IonButton
                fill="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </IonButton>

              <IonButton onClick={addAsset}>Save Asset</IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}

export default Assets;
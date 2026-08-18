import React, { useState } from "react";

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
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton
} from "@ionic/react";

import "./Assets.css";


type Severity =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

type AssetStatus =
  | "Online"
  | "Offline";


interface Asset {
  id: number;
  name: string;
  type: string;
  ipAddress: string;
  severity: Severity;
  status: AssetStatus;
}


interface AssetForm {
  name: string;
  type: string;
  ipAddress: string;
  severity: Severity;
  status: AssetStatus;
}


const emptyForm: AssetForm = {
  name: "",
  type: "",
  ipAddress: "",
  severity: "Low",
  status: "Online",
};


const Assets: React.FC = () => {

  const [assets, setAssets] = useState<Asset[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [form, setForm] =
    useState<AssetForm>(emptyForm);


  /*
   * Add asset
   */
  const addAsset = () => {

    if (
      !form.name.trim() ||
      !form.type.trim() ||
      !form.ipAddress.trim()
    ) {
      return;
    }

    const newAsset: Asset = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      ipAddress: form.ipAddress,
      severity: form.severity,
      status: form.status,
    };

    setAssets((currentAssets) => [
      ...currentAssets,
      newAsset,
    ]);

    setForm(emptyForm);

    setIsModalOpen(false);
  };


  /*
   * Delete asset
   */
  const deleteAsset = (assetId: number) => {

    setAssets((currentAssets) =>
      currentAssets.filter(
        (asset) => asset.id !== assetId
      )
    );
  };


  /*
   * Severity color
   */
  const getSeverityColor = (
    severity: Severity
  ): "success" | "warning" | "tertiary" | "danger" => {

    switch (severity) {

      case "Critical":
        return "danger";

      case "High":
        return "warning";

      case "Medium":
        return "tertiary";

      case "Low":
      default:
        return "success";
    }
  };


  return (
    <IonPage className="assets-page">

      {/* =========================
          HEADER
      ========================== */}

      <IonHeader className="assets-head">

        <IonToolbar >
          <IonButtons  slot="start">
              <IonMenuButton className="assets-page" autoHide={false} />
          </IonButtons> 
          <IonTitle className="assets-title">
            Assets
          </IonTitle>

        </IonToolbar>

      </IonHeader>


      {/* =========================
          CONTENT
      ========================== */}

      <IonContent className="ion-padding assets-head">

        <div className="assets-heading">

          <div>

            <h1>
              Monitored Assets
            </h1>

            <p>
              Manage the cloud resources
              monitored by CloudSafe.
            </p>

          </div>


          <IonButton
            onClick={() =>
              setIsModalOpen(true)
            }
          >
            Add Asset
          </IonButton>

        </div>


        {/* =========================
            EMPTY STATE
        ========================== */}

        {assets.length === 0 ? (

          <div className="assets-empty-state">

            <h2>
              No assets found
            </h2>

            <p>
              Register your first asset
              to begin monitoring it.
            </p>

            <IonButton
              onClick={() =>
                setIsModalOpen(true)
              }
            >
              Add Asset
            </IonButton>

          </div>

        ) : (

          /* =========================
             ASSET CARDS
          ========================== */

          <IonGrid >

            <IonRow>

              {assets.map((asset) => (

                <IonCol
                  size="12"
                  sizeMd="6"
                  sizeLg="4"
                  key={asset.id}
                >

                  <IonCard>

                    <IonCardHeader>

                      <IonCardTitle>
                        {asset.name}
                      </IonCardTitle>

                      <IonCardSubtitle>
                        {asset.type}
                      </IonCardSubtitle>

                    </IonCardHeader>


                    <IonCardContent>

                      <p>
                        <strong>
                          IP Address:
                        </strong>{" "}
                        {asset.ipAddress}
                      </p>


                      <p>

                        <strong>
                          Severity:
                        </strong>{" "}

                        <IonBadge
                          color={getSeverityColor(
                            asset.severity
                          )}
                        >
                          {asset.severity}
                        </IonBadge>

                      </p>


                      <p>

                        <strong>
                          Status:
                        </strong>{" "}

                        <IonBadge
                          color={
                            asset.status === "Online"
                              ? "success"
                              : "medium"
                          }
                        >
                          {asset.status}
                        </IonBadge>

                      </p>


                      <IonButton
                        size="small"
                        disabled
                      >
                        Edit
                      </IonButton>


                      <IonButton
                        size="small"
                        color="danger"
                        fill="outline"
                        onClick={() =>
                          deleteAsset(asset.id)
                        }
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


        {/* =========================
            ADD ASSET MODAL
        ========================== */}

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() =>
            setIsModalOpen(false)
          }
        >

          <IonHeader>

            <IonToolbar>

              <IonTitle>
                Add Asset
              </IonTitle>

            </IonToolbar>

          </IonHeader>


          <IonContent className="ion-padding">


            {/* Asset name */}

            <IonItem>

              <IonInput
                label="Asset name"
                labelPlacement="stacked"
                placeholder="Production Web Server"
                value={form.name}
                onIonInput={(event) => {

                  setForm((currentForm) => ({
                    ...currentForm,
                    name:
                      event.detail.value ?? "",
                  }));

                }}
              />

            </IonItem>


            {/* Asset type */}

            <IonItem>

              <IonInput
                label="Asset type"
                labelPlacement="stacked"
                placeholder="Azure Virtual Machine"
                value={form.type}
                onIonInput={(event) => {

                  setForm((currentForm) => ({
                    ...currentForm,
                    type:
                      event.detail.value ?? "",
                  }));

                }}
              />

            </IonItem>


            {/* IP address */}

            <IonItem>

              <IonInput
                label="IP address"
                labelPlacement="stacked"
                placeholder="20.51.11.2"
                value={form.ipAddress}
                onIonInput={(event) => {

                  setForm((currentForm) => ({
                    ...currentForm,
                    ipAddress:
                      event.detail.value ?? "",
                  }));

                }}
              />

            </IonItem>


            {/* Severity */}

            <IonItem>

              <IonSelect
                label="Severity"
                labelPlacement="stacked"
                value={form.severity}
                onIonChange={(event) => {

                  setForm((currentForm) => ({
                    ...currentForm,
                    severity:
                      event.detail.value as Severity,
                  }));

                }}
              >

                <IonSelectOption value="Low">
                  Low
                </IonSelectOption>

                <IonSelectOption value="Medium">
                  Medium
                </IonSelectOption>

                <IonSelectOption value="High">
                  High
                </IonSelectOption>

                <IonSelectOption value="Critical">
                  Critical
                </IonSelectOption>

              </IonSelect>

            </IonItem>


            {/* Status */}

            <IonItem>

              <IonSelect
                label="Status"
                labelPlacement="stacked"
                value={form.status}
                onIonChange={(event) => {

                  setForm((currentForm) => ({
                    ...currentForm,
                    status:
                      event.detail.value as AssetStatus,
                  }));

                }}
              >

                <IonSelectOption value="Online">
                  Online
                </IonSelectOption>

                <IonSelectOption value="Offline">
                  Offline
                </IonSelectOption>

              </IonSelect>

            </IonItem>


            {/* Form buttons */}

            <div className="asset-form-actions">

              <IonButton
                fill="outline"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Cancel
              </IonButton>


              <IonButton
                onClick={addAsset}
              >
                Save Asset
              </IonButton>

            </div>

          </IonContent>

        </IonModal>

      </IonContent>

    </IonPage>
  );
};


export default Assets;
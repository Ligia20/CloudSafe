import React, { useEffect, useState } from "react";
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
  IonText,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSpinner,
} from "@ionic/react";

import "./Assets.css";
// =========================================================
// TYPES
// =========================================================

type AssetStatus =
  | "Online"
  | "Offline";

interface Asset {
  id: string;
  name: string;
  type: string;
  ipAddress: string | null;
  hostname: string | null;
  status: AssetStatus | string;
  os: string | null;
  cpuCount: number | null;
  totalMemory: number | null;
  agentVersion: string | null;
  lastSeen: string | null;
  lastInventory: string | null;
  createdAt: string;
}

interface AssetForm {
  name: string;
  type: string;
  ipAddress: string;
  hostname: string;
}


// =========================================================
// CONSTANTS
// =========================================================

const API_URL = "/api";

const emptyForm: AssetForm = {
  name: "",
  type: "",
  ipAddress: "",
  hostname: "",
};


// =========================================================
// AUTH
// =========================================================

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


// =========================================================
// STATUS COLOR
// =========================================================

const getStatusColor = (
  status: string
): "success" | "medium" | "warning" => {

  switch (status.toLowerCase()) {

    case "online":
    case "active":
      return "success";

    case "offline":
      return "medium";

    default:
      return "warning";
  }
};


// =========================================================
// FORMAT MEMORY
// =========================================================

const formatMemory = (
  memory: number | null
) => {

  if (
    memory === null ||
    memory === undefined
  ) {
    return "N/A";
  }

  const gigabytes =
    memory / (1024 * 1024 * 1024);

  return `${gigabytes.toFixed(1)} GB`;
};


// =========================================================
// FORMAT DATE
// =========================================================

const formatDate = (
  date: string | null
) => {

  if (!date) {
    return "Never";
  }

  const parsedDate =
    new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toLocaleString();
};


// =========================================================
// ASSETS PAGE
// =========================================================

const Assets: React.FC = () => {

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [form, setForm] =
    useState<AssetForm>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [enrollmentToken, setEnrollmentToken] =
    useState<string | null>(null);

  const [showEnrollmentToken, setShowEnrollmentToken] =
    useState(false);


// =========================================================
// LOAD ASSETS
// =========================================================

  const loadAssets = async () => {

    try {

      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/v1/assets`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response.json().catch(() => null);

      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Failed to retrieve assets"
        );
      }

      setAssets(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "LOAD ASSETS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load assets"
      );

    } finally {

      setLoading(false);
    }
  };


// =========================================================
// INITIAL LOAD
// =========================================================

  useEffect(() => {
    loadAssets();
  }, []);


// =========================================================
// ADD / ENROLL CLOUD ASSET
// =========================================================

  const addAsset = async () => {

    if (
      !form.name.trim() ||
      !form.type.trim()
    ) {
      setError(
        "Asset name and asset type are required."
      );

      return;
    }

    try {

      setSaving(true);
      setError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/v1/assets/enroll`,
        {
          method: "POST",
          headers: authHeaders(),

          body: JSON.stringify({
            name: form.name.trim(),
            type: form.type.trim(),
            ipAddress:
              form.ipAddress.trim() ||
              null,
            hostname:
              form.hostname.trim() ||
              null,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Failed to enroll asset"
        );
      }

      setForm(emptyForm);
      setIsModalOpen(false);

      if (data?.enrollmentToken) {
        setEnrollmentToken(
          data.enrollmentToken
        );

        setShowEnrollmentToken(true);
      }

      setSuccessMessage(
        "Cloud asset enrolled successfully."
      );

      await loadAssets();

    } catch (error) {

      console.error(
        "ASSET ENROLLMENT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to enroll asset"
      );

    } finally {

      setSaving(false);
    }
  };


// =========================================================
// DELETE CLOUD ASSET
// =========================================================

  const deleteAsset = async (
    assetId: string
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to remove this cloud asset from monitoring?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(assetId);
      setError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/v1/assets/${assetId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Failed to delete asset"
        );
      }

      setAssets(
        currentAssets =>
          currentAssets.filter(
            asset =>
              asset.id !== assetId
          )
      );

      setSuccessMessage(
        "Cloud asset removed successfully."
      );

    } catch (error) {

      console.error(
        "DELETE ASSET ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete asset"
      );

    } finally {

      setDeletingId(null);
    }
  };


// =========================================================
// PAGE
// =========================================================

  return (
    <IonPage className="assets-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <IonHeader className="assets-head">

        <IonToolbar >
          <IonButtons  slot="start">
              <IonMenuButton className="assets-page" autoHide={false} />
          </IonButtons> 
          <IonTitle className="assets-title">
            Cloud Assets
          </IonTitle>

        </IonToolbar>

      </IonHeader>


      {/* =================================================
          CONTENT
          ================================================= */}

      <IonContent className="ion-padding assets-head">

        {/* =================================================
            PAGE HEADING
            ================================================= */}

        <div className="assets-heading">

          <div>

            <h1>
              Monitored Cloud Assets
            </h1>

            <p>
              Monitor cloud resources
              connected to CloudSafe.
            </p>

          </div>


          <IonButton
            onClick={() => {
              setError("");
              setSuccessMessage("");
              setForm(emptyForm);
              setIsModalOpen(true);
            }}
          >
            Add Cloud Asset
          </IonButton>

        </div>


        {/* =================================================
            STATUS MESSAGES
            ================================================= */}

        {error && (

          <IonText color="danger">

            <p>
              {error}
            </p>

          </IonText>

        )}


        {successMessage && (

          <IonText color="success">

            <p>
              {successMessage}
            </p>

          </IonText>

        )}


        {/* =================================================
            ENROLLMENT TOKEN
            ================================================= */}

        {showEnrollmentToken &&
          enrollmentToken && (

          <div className="enrollment-token-card">

            <h2>
              Cloud Asset Enrollment Token
            </h2>

            <p>
              Save this token. It is used by the
              monitored cloud asset to send events
              to CloudSafe.
            </p>

            <IonItem>

              <IonInput
                value={enrollmentToken}
                readonly
                type="text"
              />

            </IonItem>

            <div className="asset-actions">

              <IonButton
                onClick={async () => {

                  try {

                    await navigator.clipboard.writeText(
                      enrollmentToken
                    );

                    setSuccessMessage(
                      "Enrollment token copied."
                    );

                  } catch (error) {

                    console.error(
                      "COPY TOKEN ERROR:",
                      error
                    );

                    setError(
                      "Unable to copy enrollment token."
                    );
                  }
                }}
              >
                Copy Token
              </IonButton>

              <IonButton
                fill="outline"
                onClick={() => {
                  setShowEnrollmentToken(false);
                  setEnrollmentToken(null);
                }}
              >
                Dismiss
              </IonButton>

            </div>

          </div>

        )}


        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (

          <div className="assets-empty-state">

            <IonSpinner />

            <p>
              Loading cloud assets...
            </p>

          </div>

        )}


        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {!loading &&
          assets.length === 0 && (

          <div className="assets-empty-state">

            <h2>
              No cloud assets found
            </h2>

            <p>
              Connect your first cloud
              resource to begin monitoring.
            </p>

            <IonButton
              onClick={() =>
                setIsModalOpen(true)
              }
            >
              Add Cloud Asset
            </IonButton>

          </div>

        )}


        {/* =================================================
            ASSET CARDS
            ================================================= */}

        {!loading &&
          assets.length > 0 && (

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

                      {/* STATUS */}

                      <p>

                        <strong>
                          Status:
                        </strong>{" "}

                        <IonBadge
                          color={getStatusColor(
                            asset.status
                          )}
                        >
                          {asset.status}
                        </IonBadge>

                      </p>


                      {/* HOSTNAME */}

                      <p>

                        <strong>
                          Hostname:
                        </strong>{" "}

                        {asset.hostname ||
                          "N/A"}

                      </p>


                      {/* IP */}

                      <p>

                        <strong>
                          IP Address:
                        </strong>{" "}

                        {asset.ipAddress ||
                          "N/A"}

                      </p>


                      {/* OS */}

                      <p>

                        <strong>
                          Operating System:
                        </strong>{" "}

                        {asset.os ||
                          "N/A"}

                      </p>


                      {/* CPU */}

                      <p>

                        <strong>
                          CPU:
                        </strong>{" "}

                        {asset.cpuCount !== null
                          ? `${asset.cpuCount} cores`
                          : "N/A"}

                      </p>


                      {/* MEMORY */}

                      <p>

                        <strong>
                          Memory:
                        </strong>{" "}

                        {formatMemory(
                          asset.totalMemory
                        )}

                      </p>


                      {/* AGENT */}

                      <p>

                        <strong>
                          Agent:
                        </strong>{" "}

                        {asset.agentVersion ||
                          "Not installed"}

                      </p>


                      {/* LAST SEEN */}

                      <p>

                        <strong>
                          Last Seen:
                        </strong>{" "}

                        {formatDate(
                          asset.lastSeen
                        )}

                      </p>


                      {/* INVENTORY */}

                      <p>

                        <strong>
                          Last Inventory:
                        </strong>{" "}

                        {formatDate(
                          asset.lastInventory
                        )}

                      </p>


                      {/* ACTIONS */}

                      <div className="asset-actions">

                        <IonButton
                          size="small"
                          routerLink={`/assets/${asset.id}`}
                        >
                          View Details
                        </IonButton>


                        <IonButton
                          size="small"
                          color="danger"
                          fill="outline"
                          disabled={
                            deletingId ===
                            asset.id
                          }
                          onClick={() =>
                            deleteAsset(
                              asset.id
                            )
                          }
                        >

                          {deletingId ===
                          asset.id
                            ? "Removing..."
                            : "Remove"}

                        </IonButton>

                      </div>

                    </IonCardContent>

                  </IonCard>

                </IonCol>

              ))}

            </IonRow>

          </IonGrid>

        )}


        {/* =================================================
            ADD CLOUD ASSET MODAL
            ================================================= */}

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() =>
            setIsModalOpen(false)
          }
        >

          <IonHeader>

            <IonToolbar>

              <IonTitle>
                Add Cloud Asset
              </IonTitle>

            </IonToolbar>

          </IonHeader>


          <IonContent className="ion-padding">

            <p>
              Register a cloud resource
              that CloudSafe will monitor.
            </p>


            {/* ASSET NAME */}

            <IonItem>

              <IonInput
                label="Asset name"
                labelPlacement="stacked"
                placeholder="Production Web Server"
                value={form.name}
                onIonInput={(event) => {

                  setForm(
                    currentForm => ({
                      ...currentForm,
                      name:
                        event.detail
                          .value ?? "",
                    })
                  );

                }}
              />

            </IonItem>


            {/* ASSET TYPE */}

            <IonItem>

              <IonSelect
                label="Cloud asset type"
                labelPlacement="stacked"
                value={form.type}
                placeholder="Select asset type"
                onIonChange={(event) => {

                  setForm(
                    currentForm => ({
                      ...currentForm,
                      type:
                        event.detail
                          .value ?? "",
                    })
                  );

                }}
              >

                <IonSelectOption value="AWS EC2">
                  AWS EC2
                </IonSelectOption>

                <IonSelectOption value="Azure Virtual Machine">
                  Azure Virtual Machine
                </IonSelectOption>

                <IonSelectOption value="Google Compute Engine">
                  Google Compute Engine
                </IonSelectOption>

                <IonSelectOption value="Cloud Database">
                  Cloud Database
                </IonSelectOption>

                <IonSelectOption value="Cloud Server">
                  Cloud Server
                </IonSelectOption>

                <IonSelectOption value="Other">
                  Other
                </IonSelectOption>

              </IonSelect>

            </IonItem>


            {/* HOSTNAME */}

            <IonItem>

              <IonInput
                label="Hostname"
                labelPlacement="stacked"
                placeholder="prod-web-01"
                value={form.hostname}
                onIonInput={(event) => {

                  setForm(
                    currentForm => ({
                      ...currentForm,
                      hostname:
                        event.detail
                          .value ?? "",
                    })
                  );

                }}
              />

            </IonItem>


            {/* IP ADDRESS */}

            <IonItem>

              <IonInput
                label="IP address"
                labelPlacement="stacked"
                placeholder="20.51.11.2"
                value={form.ipAddress}
                onIonInput={(event) => {

                  setForm(
                    currentForm => ({
                      ...currentForm,
                      ipAddress:
                        event.detail
                          .value ?? "",
                    })
                  );

                }}
              />

            </IonItem>


            {/* INFORMATION */}

            <IonText>

              <p>
                The asset will initially appear
                in the dashboard after enrollment.
                Agent and inventory information
                will populate when the monitored
                resource reports to CloudSafe.
              </p>

            </IonText>


            {/* FORM ACTIONS */}

            <div className="asset-form-actions">

              <IonButton
                fill="outline"
                disabled={saving}
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Cancel
              </IonButton>


              <IonButton
                disabled={saving}
                onClick={addAsset}
              >

                {saving
                  ? "Enrolling..."
                  : "Enroll Asset"}

              </IonButton>

            </div>

          </IonContent>

        </IonModal>

      </IonContent>

    </IonPage>
  );
};

export default Assets;
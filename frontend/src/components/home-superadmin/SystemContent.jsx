import axios from "../../utils/axiosConfig";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";

export const SystemMaintenance = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");

  const handleOpenModal = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const endpoint =
      actionType === "old" ? "/api/maintenance/old" : "/api/maintenance/all";

    try {
      const res = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      });
      alert(res.data.message);
    } catch (err) {
      alert("Failed to perform maintenance.");
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div class="super-admin-system-settings-main-container">
      <h2>System Settings</h2>
      <p class="super-admin-system-settings-warning"> <i class="fa-solid fa-triangle-exclamation"></i>
        These actions are <strong>permanent</strong> and <strong>cannot be undone</strong>. Proceed only if you fully understand the consequences.
      </p>

      <div class="super-admin-system-settings-buttons-row">
        <div class="super-admin-system-settings-button" onClick={() => handleOpenModal("old")}>
          <h1>Delete Old Data</h1>
          <p>Remove exams and logs older than 7 months</p>
        </div>

        <div class="super-admin-system-settings-button" onClick={() => handleOpenModal("all")}>
          <h1>Clear All System Data</h1>
          <p>Deletes all exams, student submissions, and logs.</p>
        </div>
      </div>

      {showModal && (
        <div
        onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center",
              width: "90%",
              maxWidth: "450px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Confirm Action</h3>
            <p>
              {actionType === "old"
                ? "[WARNING] This will permanently delete all data older than 7 months — including exams, logs, and related records. This cannot be undone. Do you want to proceed?"
                : "[CRITICAL ACTION] This will erase ALL examination data, student submissions, and system logs from the entire system. This operation is irreversible and should only be done during a full reset. Are you absolutely sure you want to continue?"}
            </p>
            <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleConfirm}
              style={{
                padding: "10px 20px",
                backgroundColor: "#d9534f",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100px",
              }}
            >
              Yes
            </button>

            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ccc",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginLeft: "10px",
                width: "100px",
              }}
            >
              Cancel
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}





function SystemSettings() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  return (
    <>
    <div className="super-admin-whole">
      <HomeSuperadmin />        
      <SystemMaintenance />
    </div>
    </>
  )
}

export default SystemSettings;




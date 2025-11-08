import axios from "../utils/axiosConfig";
import React, { useState }  from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { toast } from 'react-toastify';
import { HomeSuperadmin } from "./HomeSuperadmin";
import { SidebarTeacher } from "../components/SidebarTeacher";
import { ForgotPasswordLoggedInComponent } from "./ForgotPassword";

const SettingsBasicInformation = () => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({});

  const userId = user.userId;

  useEffect(() => {
    if(userId) fetchUserInfo();
  }, [userId]);
  
  const fetchUserInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/users/${userId}`, config); // getUserById 

      setUserInfo(res.data);
    } catch (err) {
      console.log('fetchUserInfo failed, in ExamAnalytics');
      console.error(err.message);
    }
  }

  return (
    <>
    <div class="super-admin-account-seetings-info-container">
      <h3>Basic Information</h3>
      <p><strong>First Name:</strong> {userInfo.first_name}</p>
      <p><strong>Middle Initial:</strong> {userInfo.middle_initial}</p>
      <p><strong>Last Name:</strong> {userInfo.last_name}</p>
      <p><strong>Email:</strong> {userInfo.email}</p>
      <p><strong>School ID:</strong> {userInfo.school_id}</p>
      <p>
        <strong>Account Created:</strong>{" "} {userInfo.created_at ? new Date(userInfo.created_at).toLocaleString() : ""}
      </p>
    </div>
    </>
  )
}

const SettingsPasswordManage = () => {
  const { accessToken, user } = useAuth();
  const userId = user.userId

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    // Check if new passwords match first
    if (newPassword !== confirmNewPassword) {
      setMessage("New passwords do not match.");
      return; // stop submission
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      };

      const res = await axios.post(`/change/current-password/${userId}`,
        { currentPassword, newPassword },
        config
      );

      toast.info(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to change password");
    }
  };

  const [showForgot, setShowForgot] = useState(false);

  return (
    <div class="super-admin-account-seetings-change-password-container">
      {!showForgot ? (
        <>
        <h3>Password Management</h3>
        {message && <p>{message}</p>}
        <form onSubmit={handleChangePassword}>
          <div class="super-admin-account-settings-change-password-form">
            <label htmlFor="currentPassword">Current Password:</label><br />
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div class="super-admin-account-settings-change-password-input">
            <label htmlFor="newPassword">New Password:</label><br />
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div class="super-admin-account-settings-change-password-input">
            <label htmlFor="confirmNewPassword">Confirm New Password:</label><br />
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <a className="forgot-password" onClick={() => setShowForgot(true)}>Forgot Password?</a>
          <br></br>
          <button className="super-admin-account-seetings-change-password-container-button" type="submit">Update Password</button>
        </form>
        </>
      ):(
        <>
        <ForgotPasswordLoggedInComponent />
        </>
      )}
      
    </div>
  );
}

const SettingsAccountControl = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmEnabled, setConfirmEnabled] = useState(false);

  const requiredPhrase = "DELETE ACCOUNT";

  //Verify password
  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      setMessage("Please enter your current password.");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      };

      await axios.post("/verify/current-password", { currentPassword }, config);

      setVerified(true);
      setMessage("Password verified. You can now delete your account.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Incorrect password.");
      setVerified(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setConfirmationText("");
    setConfirmEnabled(false);
  };

  const handleChangeText = (e) => {
    setConfirmationText(e.target.value);
    setConfirmEnabled(e.target.value.trim() === requiredPhrase);
  };

  const handleDeleteAccount = async () => {
    if (!confirmEnabled) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      };

      await axios.delete("/user/delete", config);

      setShowModal(false);
      alert("Your account has been deleted.");
      navigate("/login"); // or logout
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete account.");
    }
  };

  return (
    <div class="super-admin-account-deletion-account-control-container">
      <h3>Account Control</h3>

    <div class="super-admin-account-deletion-account-input">
      {!verified && (
        <>
        <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button onClick={handleVerifyPassword}>Verify Password</button>
        </>
      )} 
      {message && <p style={{ color: "red", marginBottom: "10px" }}>{message}</p>}
      {verified && !showModal && (
        <button onClick={handleOpenModal}> Delete Account </button>
      )}
    </div>
     

      

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "28px 32px",
              borderRadius: "16px",
              width: "380px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              textAlign: "center",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <h4 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: 600 }}>Confirm Account Deletion</h4>
            <p style={{
              marginBottom: "16px",
              color: "#475569",
              fontSize: "15px",
              whiteSpace: "nowrap", // 👈 prevents wrapping
            }}>Type <strong>{requiredPhrase}</strong> to confirm deletion:</p>
            <input
              type="text"
              value={confirmationText}
              onChange={handleChangeText}
              style={{
                width: "100%",
                padding: "12px 14px",
                marginBottom: "20px",
                border: "1.5px solid #cbd5e1",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14.5px",
                transition: "all 0.3s ease",
              }}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={handleDeleteAccount}
                disabled={!confirmEnabled}
                style={{
                  backgroundColor: confirmEnabled ? "#ef4444" : "#fca5a5",
                  color: "white",
                  fontWeight: 600,
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: confirmEnabled ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                }}
              >
                Confirm Delete
              </button>
              <button onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "#e2e8f0",
                  color: "#1e293b",
                  fontWeight: 600,
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const UserSettingsContentSuperadmin = () => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'basic-information');

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <>
    <div className="user-settings-outer-container">

      <div className="user-settings-inner-container-one">
        <div className="user-settings-account-info" onClick={() => setActiveTab('basic-information')}>Account Information</div>
        <div className="user-settings-change-password" onClick={() => setActiveTab('password-manage')}>Change Password</div>
        <div className="user-settings-account-deletion" onClick={() => setActiveTab('account-control')}>Account Deletion</div>
      </div>
      <div className="user-settings-inner-container-two">
        {activeTab === "basic-information" && <SettingsBasicInformation />}
        {activeTab === "password-manage" && <SettingsPasswordManage />}
        {activeTab === "account-control" && <SettingsAccountControl />}
      </div>

    </div>
    </>
  )
}

export const UserSettingsContentTS = () => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'basic-information');

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <>
    <div className="user-settings-outer-container-ts">

      <div className="user-settings-inner-container-one">
        <div className="user-settings-account-info" onClick={() => setActiveTab('basic-information')}>Account Information</div>
        <div className="user-settings-change-password" onClick={() => setActiveTab('password-manage')}>Change Password</div>
        <div className="user-settings-account-deletion" onClick={() => setActiveTab('account-control')}>Account Deletion</div>
      </div>
      <div className="user-settings-inner-container-two">
        {activeTab === "basic-information" && <SettingsBasicInformation />}
        {activeTab === "password-manage" && <SettingsPasswordManage />}
        {activeTab === "account-control" && <SettingsAccountControl />}
      </div>

    </div>
    </>
  )
}

export const UserSettingsStudent = () => { //student
  return (
    <>
    <div className="super-admin-whole">
      <HomeSuperadmin />
      <div className="main-home-content" style={{ padding: '10px' }}>          
        <h2>Admin Analytics</h2>

        <UserSettingsContentTS />
      </div>
    </div>
    </>
  )
}

export const UserSettingsTeacher = () => { //student
  return (
    <>
    <div className="teacher-home-whole">
      <SidebarTeacher />
      <UserSettingsContentTS />
    </div>
    </>
  )
}

function UserSettingsSuperadmin() { //superadmin
  return (
    <>
    <div className="super-admin-whole">
      <HomeSuperadmin />
      <div className="main-home-content" style={{ padding: '10px' }}>          
        <h2>Admin Analytics</h2>

        <UserSettingsContentSuperadmin />
      </div>
    </div>
    </>
  )
}

export default UserSettingsSuperadmin;
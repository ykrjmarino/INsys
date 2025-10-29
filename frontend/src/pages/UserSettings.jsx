import axios from "../utils/axiosConfig";
import React, { useState }  from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

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
    <div style={{ backgroundColor: '#da84ffff', margin: '2px', padding: '5px' }}>
      <h3>Basic Information</h3>
      <p><strong>First Name:</strong> {userInfo.first_name}</p>
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

      alert(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to change password");
    }
  };

  return (
    <div style={{ backgroundColor: "#da84ffff", margin: "2px", padding: "10px" }}>
      <h3>Password Management</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleChangePassword}>
        <div style={{ marginBottom: "10px" }}>
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

        <div style={{ marginBottom: "10px" }}>
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

        <div style={{ marginBottom: "10px" }}>
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
        <a className="forgot-password" href="/account-settings/forgot-password">Forgot Password?</a>
        <br></br>
        <button type="submit">Update Password</button>
      </form>
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
    <div style={{ backgroundColor: "#da84ffff", margin: "2px", padding: "5px" }}>
      <h3>Account Control</h3>

      {!verified && (
        <div>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button onClick={handleVerifyPassword}>Verify Password</button>
        </div>
      )}

      {message && <p style={{ color: "red" }}>{message}</p>}

      {verified && !showModal && (
        <button
          style={{ backgroundColor: "red", color: "white", marginTop: "10px" }}
          onClick={handleOpenModal}
        >
          Delete Account
        </button>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              textAlign: "center",
            }}
          >
            <h4>Confirm Account Deletion</h4>
            <p>Type <strong>{requiredPhrase}</strong> to confirm deletion:</p>
            <input
              type="text"
              value={confirmationText}
              onChange={handleChangeText}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button
              onClick={handleDeleteAccount}
              disabled={!confirmEnabled}
              style={{ backgroundColor: "red", color: "white", marginRight: "10px" }}
            >
              Confirm Delete
            </button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserSettings () {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'information');

  return (
    <>
    <div style={{ backgroundColor: '#00c21aff', margin: '5px', padding: '10px' }}>

      <div style={{ backgroundColor: '#8df79bff', margin: '10px', padding: '20px' }}>
        <div onClick={() => setActiveTab('basic-information')}>Account Information</div>
        <div>|</div>
        <div onClick={() => setActiveTab('password-manage')}>Change Password</div>
        <div>|</div>
        <div onClick={() => setActiveTab('account-control')}>Account Deletion</div>
      </div>
      <div style={{ backgroundColor: '#8ec696ff', margin: '5px', padding: '10px' }}>
        {activeTab === "basic-information" && <SettingsBasicInformation />}
        {activeTab === "password-manage" && <SettingsPasswordManage />}
        {activeTab === "account-control" && <SettingsAccountControl />}
      </div>

    </div>
    </>
  )
}

export default UserSettings;
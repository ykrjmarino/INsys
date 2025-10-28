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
      const res = await axios.get(`/users/${userId}`, config); // getExamAnalytics 

      setUserInfo(res.data);
    } catch (err) {
      console.log('fetchExamInfo failed, in ExamAnalytics');
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

      setMessage(res.data.message);
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

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

const SettingsAccountControl = () => {
  return (
    <>
    <div style={{ backgroundColor: '#da84ffff', margin: '2px', padding: '5px' }}>
      account control here
    </div>
    </>
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
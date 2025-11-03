import axios from "../../utils/axiosConfig";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";
import { ManageUsersTable } from "./RolesTable";

export const ManageUser = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [infoStats, setInfoStats] = useState({});
  const [infoLogs, setInfoLogs] = useState([]);

  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'student');

  useEffect(()=>{
    fetchLogs();
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);


  const fetchLogs = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/system/logs`, config);
     

      setInfoLogs(res.data || []);
      console.log(res.data);

      console.log('fetchLogs wrking');
    } catch (error) {
      console.log('fetchLogs failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  const exportUserByRole = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const response = await axios.get(`/export/users/${activeTab}`, { 
        ...config,
        responseType: "blob"
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${activeTab}_list.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log('exportUserByRole wrking');
    } catch (error) {
      console.log('exportUserByRole failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  return (
    <>
    <div className="super-admin-whole">
      <HomeSuperadmin />
      <div className="main-home-content" style={{ padding: '10px' }}>
        <div className="user-management-export" style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px"}}>
          <h2>User Management</h2> <i className="fa-solid fa-file-export" onClick={exportUserByRole}></i>
        </div>
      
        <div style={{ display: 'flex', gap: '5px', margin: '5px' }}>
          <div onClick={() => setActiveTab('student')}>Students</div>
          <div>|</div>
          <div onClick={() => setActiveTab('admin')}>Admins</div>
          <div>|</div>
          <div onClick={() => setActiveTab('superadmin')}>Superadmins</div>
        </div>

        {activeTab === 'student' && <ManageUsersTable selectedRole="student" />}
        {activeTab === 'admin' && <ManageUsersTable selectedRole="admin" />}
        {activeTab === 'superadmin' && <ManageUsersTable selectedRole="superadmin" />}
      </div>
    </div>
    </>
  )
}
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

  
  useEffect(() => { //unmount
    return () => {
      localStorage.removeItem('activeTab');
    };
  }, []);


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
      console.log("active tab: ", activeTab);
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
    <div className="super-admin-manage-account-whole">
      <HomeSuperadmin />
      
      <div className="super-admin-manange-main-home-content">
        <div className="user-management-export" style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px"}}>
          <h2>User Management</h2> 
          <div className="export-wrapper">
            <i className="fa-solid fa-file-export" onClick={exportUserByRole}></i>
            <span className="tooltip">Export</span>
          </div>
          
        </div>

        <div className="super-admin-manage-account-components">
          <div className="super-admin-manage-account-choice">
            <div className={`super-admin-manage-student-btn ${activeTab === 'student' ? 'active' : ''}`} onClick={() => setActiveTab('student')}>Students</div>
            <div className={`super-admin-manage-student-btn ${activeTab === 'admin' ? 'active' : ''}`}onClick={() => setActiveTab('admin')}>Admins</div>
            <div className={`super-admin-manage-student-btn ${activeTab === 'superadmin' ? 'active' : ''}`}onClick={() => setActiveTab('superadmin')}>Superadmins</div>
          </div>
        </div>

        {activeTab === 'student' && <ManageUsersTable selectedRole="student" />}
        {activeTab === 'admin' && <ManageUsersTable selectedRole="admin" />}
        {activeTab === 'superadmin' && <ManageUsersTable selectedRole="superadmin" />}
      </div>
    </div>
    </>
  )
}
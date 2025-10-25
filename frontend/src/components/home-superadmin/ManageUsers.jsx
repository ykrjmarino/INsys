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

  const [activeTab, setActiveTab] = useState('students');

  useEffect(()=>{
    fetchLogs();
  }, [accessToken]);


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

  return (
    <>
    <div className="whole">
      <HeaderTeacher />
      <div className="side-bar-and-main-container">
        <HomeSuperadmin />
        <div className="main-home-content" style={{ padding: '10px' }}>          
          <h2>User Management</h2>

          <div style={{ display: 'flex', gap: '5px', margin: '5px' }}>
            <div onClick={() => setActiveTab('students')}>Students</div>
            <div>|</div>
            <div onClick={() => setActiveTab('admins')}>Admins</div>
            <div>|</div>
            <div onClick={() => setActiveTab('superadmins')}>Superadmins</div>
          </div>

          {activeTab === 'students' && <ManageUsersTable selectedRole="student" />}
          {activeTab === 'admins' && <ManageUsersTable selectedRole="admin" />}
          {activeTab === 'superadmins' && <ManageUsersTable selectedRole="superadmin" />}
        </div>
      </div>
    </div>
    </>
  )
}
import axios from "../../utils/axiosConfig";
import { useExams } from "../../hooks/useExams";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import HeaderTeacher from "../Header";
import { HomeSuperadmin } from "../../pages/HomeSuperadmin";

export const DashboardSuper = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [infoStats, setInfoStats] = useState({});
  const [infoLogs, setInfoLogs] = useState([]);

  useEffect(()=>{
    fetchSystemAnalytics(); 
    fetchLogs();
  }, [accessToken]);

  const fetchSystemAnalytics = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/all/analytics`, config);

      setInfoStats(res.data || {});

    // {
    //   total_exams: 10,
    //   total_students: 100,
    //   total_admins: 5,
    //   total_superadmins: 1,
    //   total_users: 106
    // }

      console.log('fetchSystemAnalytics wrking');
    } catch (error) {
      console.log('fetchSystemAnalytics failed, in ExamAnalytics');
      console.error(error.message);
    }
  }

  const fetchLogs = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const res = await axios.get(`/system/logs`, config);
      /*
      [
        {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "middle_initial": "R",
          "action": "Published exam: 5",
          "target_id": 5,
          "created_at": "2025-10-24T09:30:00.000Z"
        },
        {
          "id": 2,
          "first_name": "Jane",
          "last_name": "Smith",
          "middle_initial": "R",
          "action": "Updated password",
          "target_id": 3,
          "created_at": "2025-10-24T08:45:00.000Z"
        }
      ]
      */

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
          <h2>Dashboard</h2>

          {/* Stats Section */}
          <section className="super-dashboard-stats-section" style={{ marginBottom: '20px' }}>
            <h3>System Overview</h3>
            <ul>
              <li>Total Exams: {infoStats.total_exams || 0}</li>
              <li>Total Students: {infoStats.total_students || 0}</li>
              <li>Total Admins: {infoStats.total_admins || 0}</li>
              <li>Total Superadmins: {infoStats.total_superadmins || 0}</li>
              <li>Total Users: {infoStats.total_users || 0}</li>
            </ul>
          </section>

          {/* Logs Section */}
          <section className="super-dashboard-logs-section">
            <h3>Recent System Logs</h3>
            <div className="super-dashboard-logs-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {infoLogs.map((log) => (
                <div key={log.id} className="super-dashboard-log-item" style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  <p><strong>{log.first_name} {log.middle_initial}. {log.last_name}</strong></p>
                  <p>{log.action}</p>
                  <p style={{ fontSize: '0.85em', color: '#555' }}>{new Date(log.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  )
}

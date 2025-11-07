import axios from "../../utils/axiosConfig";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogoutSpan } from "../Logout";

const ScoreDetails = () => {
  const { accessToken, user } = useAuth();
  

  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const fetchHistory = async() => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };
      try {
        const res = await axios.get('/students/exam-history', config);
        setHistory(res.data);
        console.log(res.data || "history");
        /*
          exam_id: 51
          section_name: "BSCS 2-A"
          submitted_at: "2025-10-19T14:19:32.587Z"
          teacher_name: "Mina Myoui"
          title: "Testing with student data"
          total_points: 22
          total_score: 17
        */
      } catch (error) {
        console.error("Error fetching score history: ", error);
      }
    }
    fetchHistory();
  }, []);
  return (
    
    <>
    {history.map((h) => (
      <div key={h.exam_id} className="history-grids">
        <div className="student-home-scores">
          <p>{h.title}</p>
          <p>{h.section_name}</p>
          <p>{h.total_score} / {h.total_points}</p>
          <p>{h.teacher_name}</p>
          <p>{new Date(h.submitted_at).toLocaleString()}</p>
        </div>
      </div>
    ))}
    </>
  )
}

function ScoreHistory() {
  const navigate = useNavigate();

  return (
    <div className="student-home-whole">
      <div className="student-home-header"></div>

      <input type="checkbox" className="student-home-open-sidebar-menu" id="student-home-open-sidebar-menu" />
      <label htmlFor="student-home-open-sidebar-menu" className="student-home-sidebar-icon-toggle">
          <div className="s-h-spinner s-h-diagonal s-h-part-1"></div>
          <div className="s-h-spinner s-h-horizontal"></div>
          <div className="s-h-spinner s-h-diagonal s-h-part-2"></div>
      </label>

      <div id="student-home-sidebar-menu">
        <div className="sidebar-logo">
          <img src="insys3.PNG" alt="Sidebar Logo" />
        </div>

        <div className="student-home-sidebar-buttons">
          <h1 className="student-home-sidebar-title">Tools</h1>
          <button className="student-home-sidebar-btn" onClick={()=> navigate('/student-entry')}><i className="fas fa-chart-bar"></i> Dashboard</button>
          <button className="student-home-sidebar-btn" onClick={()=> navigate('/student-history')}><i className="fa-solid fa-clock-rotate-left"></i>History</button>
          <button className="student-home-sidebar-btn"><i className="fa-solid fa-gear"></i> Settings</button>
        </div>


        <div className="student-home-logout">
          <LogoutSpan className="student-home-logout-btn"/>
        </div>
      </div>


      <div className="student-home-history">
        <div className="student-home-history-label">History <i className="fa-solid fa-clock-rotate-left"></i></div>
        <div className="student-home-grid">
          <div className="history-grids-label">
            <span className="history-label">Title</span>
            <span className="history-label">Class/Section</span>
            <span className="history-label">Score</span>
            <span className="history-label">Instructor</span>
            <span className="history-label">Date Taken</span>
          </div>

          <ScoreDetails />
          
        </div>

      </div>
    </div>
  )
}

export default ScoreHistory;
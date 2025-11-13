import axios from "../../utils/axiosConfig";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogoutSpan } from "../Logout";
import { SidebarStudent } from "../SidebarTS";

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
      <SidebarStudent />


      <div className="student-home-history">
        <div className="student-home-history-label">History</div> 
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
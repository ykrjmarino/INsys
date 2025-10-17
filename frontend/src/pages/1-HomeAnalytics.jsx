import axios from "../utils/axiosConfig.js";
import React from "react";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';

//components
import { HomeCard } from "../components/home-teacher/CompletedExams.jsx";
import HomeTeacher from "./HomeTeacher.jsx";
import HeaderTeacher, { SideBar } from "../components/Header.jsx";


function AnalyticsHomeExams ({ exams, onClickDel, onClickDupe, className }) {
  const navigate = useNavigate();

  return (
    <>
    <div className="main-home-content">
      <label className="main-container-title">Exams Analytics</label>
      <div className="grid-container">
        {exams.map((e) => (
          <HomeCard //these from the database so use snake_case
            className={className}
            key={e.exam_id}
            title={e.title}
            subjCode={e.subj_code}
            schedule={e.schedule}
            status={e.status}
            sections={e.sections}
            data={e}
            onClickDel={onClickDel} //send to: const handleDeleteExam = (examId)=>{}
            onClickDupe={onClickDupe}
            onClickNav={() => navigate(`/exam-analytics/${e.exam_id}`)}
          />
        ))}
      </div>
    </div>
      
    </>
  )
}


function HomeAnalytics() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exams, deleteExam, duplicateExam, fetchAllExams } = useExams();
  
  return (
    <>
    <div className="whole">
      <HeaderTeacher />
      <div className="side-bar-and-main-container">
        <SideBar />
        <AnalyticsHomeExams 
          exams={exams.filter(e => e.status === 'completed')} 
          onClickDel={deleteExam} 
          onClickDupe={duplicateExam} 
        />
      </div>
    </div>
    </>
  )
}

export default HomeAnalytics;
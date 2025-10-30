import axios from "../../utils/axiosConfig";
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

//components
import RadioButtonOptions from "../RadioButtonOptions";
import InputField from "../InputFields"
import SelectField from "../SelectFields";
import Button from "../Buttons"

export const FinishExamInfo = ({ examTitle, examAutomatedScore, examTotalPoints, examTotalQuestions }) => { 
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  
  const { examId } = useParams(); 

  const submitToTrue = async() => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

      await axios.post(`/student/exams/${examId}/submit`, { examId }, config);
    } catch (error) {
      console.log(
        error.response?.data?.error ||
        error.response?.data ||
        error.message
      );
      alert(error.response?.data?.error || "Failed to submit = true");
    }

  }
  return (
    <>
      <div className="student-s-exam-wrapper">
        <div className="student-s-exam-results-card">
          <div className="student-s-exam-header">
            <h1 className="student-s-exam-title">{examTitle}</h1>
            <img src="/images/correct.png" alt="Checkmark" className="student-s-checkmark-icon" />
          </div>

          <div className="student-s-score-section">
            <div className="student-s-score-display">{examAutomatedScore}/{examTotalPoints}</div>
          </div>

          <div className="student-s-student-info">
            <div className="student-s-student-label">Student:</div>
            <div className="student-s-student-name">{user.nameFNfirst}</div>
            <div className="student-s-student-id">{user.schoolId}</div>
          </div>

          <div className="student-s-exam-details">
            <div className="student-s-detail-box">
              <div className="student-s-detail-label">Total Questions</div>
              <div className="student-s-detail-value">{examTotalQuestions || '1000'}</div>
            </div>
            <div className="student-s-detail-box">
              <div className="student-s-detail-label">Time Taken</div>
              <div className="student-s-detail-value">--</div>
            </div>
          </div>

          <div className="student-s-submission-message">
            Ready to submit your responses?
          </div>

          <Button 
            className="student-s-dashboard-button"
            label={'Submit & Return to Dashboard'}
            onClick={async() => {
              await submitToTrue();
              setTimeout(() => navigate("/student-entry"), 700);
            }} 
          />
        </div>
      </div>
    </>
  )
}
 
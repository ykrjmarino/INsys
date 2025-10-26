import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

import axios from "../utils/axiosConfig.js";

export function useExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const { user, accessToken } = useAuth();
  
  useEffect(() => {
    if (!user.userId || !accessToken) return;
    fetchExamsByStatus('draft'); // fetch drafts on mount
  }, [accessToken, user.userId]);

  console.log("User:", user);
  console.log("Access Token:", accessToken);

  //========= duplicate exam =========//
  const duplicateExam = async (examId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      await axios.post(`/exams/${examId}/duplicate`, {}, config);
      console.log("Exam duplicated");

      // Refetch updated list for this user
      const updatedExams = await axios.get(`/exams/${user.userId}`, config);
      setExams(updatedExams.data);
    } catch (err) {
      console.error("Failed to duplicate exam:", err);
    }
  };

  //========= delete exam =========//
  const deleteExam = async(examId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      await axios.delete(`/exams/${examId}`, config);
  
      const updatedExams = await axios.get(`/exams/${user.userId}`, config);
      //refetch and update exams from DB.. 
      setExams(updatedExams.data);
      console.log('exam deleted');
    } catch (error) {
      console.error("Failed to delete exam:", error);
    }
  }

  //========= navigate and filter by status =========//
  const fetchExamsByStatus = async(status) => { //backend: getExamsByStatus
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };
    try {
      const res = await axios.get('/exams/status', {
        params: { filter: status }   //send status in database
      }, config);
      
      setExams(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch exams by status", err);
      return [];
    }
  };

  const fetchExamsByTeacher = async (teacherId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };
    try {
      const res = await axios.get(`/exams/${teacherId}`, config);
      setExams(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch exams for teacher:", err);
      return [];
    }
  };

  return { exams, duplicateExam, deleteExam, fetchExamsByStatus, fetchExamsByTeacher };
}
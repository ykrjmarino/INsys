import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../utils/axiosConfig.js';
import { toast } from 'react-toastify';
//context
import { useAuth } from '../context/AuthContext.jsx';
import { SidebarTeacher } from '../components/SidebarTS.jsx';

function ArchivedExams() {
  const { user, accessToken } = useAuth();
  const [archivedExams, setArchivedExams] = useState([]);
  const userId = user.userId;

  const [showUnarchive, setShowUnarchive] = useState(false);
  const [examToRestore, setExamToRestore] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

      try {
        const res = await axios.get(`/exams/archived/${userId}`, config);
        setArchivedExams(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExams();
  }, [accessToken, userId]);

  const handleUnarchive = async (examId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    }; 

    try {
      await axios.patch(`/exams/${examId}/unarchive`, config);

      setArchivedExams(prev => prev.filter(exam => exam.exam_id !== examId));
      toast.success("Exam restored!");
    } catch (error) {
      console.error("Failed to restore exam: ", error.message);
    } finally {
      setShowUnarchive(false);
      setExamToRestore(null);
    }
  };

  return (
    <>
    <div className="teacher-home-whole">
      <SidebarTeacher />
      <div className="teacher-archive-main-content">
        <div className="teacher-archive-labels-dropdown-container">
          <label className="teacher-archive-main-container-title">Exam Archives</label>
        </div>
        <div className="teacher-archive-grid-container">
          {archivedExams.length === 0 ? (
            <div> No archived exams found. </div>
          ) : (
            archivedExams.map(exam => (
              <ArchiveExamCard
                key={exam.exam_id}
                exam={exam}
                onClick={() => {
                  setExamToRestore(exam);
                  setShowUnarchive(true);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
    {showUnarchive && (
      <div className="admins-exam-modal" onClick={() => setShowUnarchive(false)}>
        <div className="admins-exam-modal-container" onClick={(e) => e.stopPropagation()}>
          <h4 className="admins-exam-modal-title">Confirm Restore</h4>
          <p className="admins-exam-modal-text">
            Do you want to restore this exam?
          </p>
          <div className="admins-exam-modal-buttons">
            <button
              className="restore"
              onClick={() => handleUnarchive(examToRestore.exam_id)}
            >
              Archive
            </button>
            <button
              className="cancel"
              onClick={() => {
                setShowUnarchive(false);
                setExamToRestore(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export const ArchiveExamCard = ({ exam, onClick }) => {

  return (
    <div className="teacher-archive-grid-item">
      <div className="teacher-archive-exam-content">
        <div className="overlay-container">
          <p className="overlay-text-archive">
            {exam.title}
          </p>
        </div>
        
        <div className="icon-wrapper">
          <i onClick={() => onClick(exam.exam_id)} className="fa-solid fa-arrows-rotate"></i>
        </div>
      </div>

      <div className="teacher-archive-taskbar">
          <div className="teacher-archive-taskbar-left">{exam.exam_code}</div>
          <div className="teacher-archive-taskbar-right">Status: <span className="done-text">{exam.status}</span></div>
      </div>
    </div>
  );
};

export default ArchivedExams;
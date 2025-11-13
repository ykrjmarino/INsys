import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../utils/axiosConfig.js';

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';

import { SidebarTeacher } from '../components/SidebarTS.jsx';

function ArchivedExams() {
  const { user, accessToken } = useAuth();
  const [archivedExams, setArchivedExams] = useState([]);
  const userId = user.userId;

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

  return (
    <div className="teacher-home-whole">
      <SidebarTeacher />
      <div className="teacher-home-main-content">   
        <div className="teacher-home-labels-dropdown-container">
          <label className="main-container-title">Archived Exams</label>
        </div>
        <div className="grid-container">
          {archivedExams.length === 0 ? (
            <div>
              No archived exams found.
            </div>
          ) : (
            archivedExams.map(exam => (
              <ArchiveExamCard
                key={exam.exam_id}
                exam={exam}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const ArchiveExamCard = ({ exam }) => {
  return (
    <div>
      <p className="super-admin-exam-card-title"><b>Title:</b> {exam.title}</p>
      <p className="super-admin-exam-card-status"><b>Status:</b> {exam.status}</p>
    </div>
  );
};

export default ArchivedExams;
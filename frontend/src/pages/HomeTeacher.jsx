import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axiosConfig.js';

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';

//components
import Button from '../components/Buttons.jsx';
import LogoutButton, { LogoutSpan } from '../components/Logout.jsx'
import SelectField from '../components/SelectFields.jsx';
import DraftExams from '../components/home-teacher/DraftExams.jsx';
import PublishedExams from '../components/home-teacher/PublishedExams.jsx';
import OngoingExams from '../components/home-teacher/OngoingExams.jsx';
import CompletedExams from '../components/home-teacher/CompletedExams.jsx';
import HeaderTeacher, { SideBar } from '../components/Header.jsx';

export const HomeExamsTeacher = () => {
  //========= home filter status =========//
  const { exams, deleteExam, duplicateExam, fetchAllExams } = useExams();

  const [status, setStatus] = useState('draft');
  const [allExams, setAllExams] = useState([]);

  
  useEffect(() => {
    const load = async () => {
      const data = await fetchAllExams;
      setAllExams(data);
    };
    load();
  }, []);

  const optionsArray = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" }
  ];

  return (
    <>
{/* <!-- main home content -->
    <!-- start --> */}
    <div className="main-home-content">
      <label className="main-container-title">Exams</label>
      <SelectField className="dropdown-main"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={optionsArray}
      />

  {/* <!--  grid container -->
      <!-- start grid container --> */}
      <div className="grid-container">

    {/* <!-- grid item-->
        <!--start--> */}
          {status === 'draft' && 
          <DraftExams 
            exams={exams.filter(e => e.status === 'draft')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam}
          />}
          {status === 'published' && 
          <PublishedExams 
            exams={exams.filter(e => e.status === 'published')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
          />}
          {status === 'ongoing' && 
          <OngoingExams 
            exams={exams.filter(e => e.status === 'ongoing')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
          />}

          {status === 'completed' && 
          <CompletedExams 
            exams={exams.filter(e => e.status === 'completed')} 
            onClickDel={deleteExam} 
            onClickDupe={duplicateExam} 
          />}

      {/* <!--  grid container -->
          <!-- end grid container --> */}
          </div>


    {/* <!-- main home content -->
        <!-- end --> */}
        </div>
    </>
  );
}

function HomeTeacher() {
  return (
    <>
    <div className="whole">
      <HeaderTeacher />
      <div className="side-bar-and-main-container">
        <SideBar />
        <HomeExamsTeacher />
      </div>
    </div>
    </>
  );
}

export default HomeTeacher;
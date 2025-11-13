import axios from "../utils/axiosConfig.js";
import { useNavigate } from "react-router-dom";

//context
import { useAuth } from '../context/AuthContext.jsx';
//hooks
import { useExams } from '../hooks/useExams.js';

//components
import { SidebarTeacher } from "../components/SidebarTS.jsx";
import HomeCard from "../components/home-teacher/HomeCard.jsx"


function AnalyticsHomeExams ({ exams, onClickDel, onClickDupe, className, onClickArch }) {
  const navigate = useNavigate();

  return (
    <>
    <div className="teacher-home-main-content">
      <div className="teacher-home-labels-dropdown-container">
       <label className="main-container-title">Exams Analytics</label>
      </div>
      
      <div className="grid-container">
        {exams.map((e) => (
          <HomeCard //these from the database so use snake_case
            className={className}
            key={e.exam_id}
            title={e.title}
            examCode={e.exam_code}
            schedule={e.schedule}
            status={e.status}
            sections={e.sections}
            data={e}
            onClickDel={onClickDel} //send to: const handleDeleteExam = (examId)=>{}
            onClickDupe={onClickDupe}
            onClickNav={() => navigate(`/exam-analytics/${e.exam_id}`)}
            onClickArch={onClickArch}
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
    <div className="teacher-home-whole">
      <SidebarTeacher />
      <AnalyticsHomeExams 
        exams={exams.filter(e => e.status === 'completed')} 
        onClickDel={deleteExam} 
        onClickDupe={duplicateExam} 
      />
    </div>
    </>
  )
}

export default HomeAnalytics;
import Button from '../../components/Buttons.jsx'
import { useNavigate } from "react-router-dom";

export const HomeCard = ({ data, title, subjCode, schedule, status, sections, onClickNav, onClickDel, onClickDupe }) => {

  return (
    <div className="grid-item"
      onClick={onClickNav}
      style={{ opacity: 0.8, cursor: "default" }}
    > {/* goes to the specific exam when div is clicked */}

      <div className="teacher-home-grid-item-buttons" >
        <button 
          className="teacher-home-duplicate-button"
          onClick={(e) => { 
            e.stopPropagation(); 
            onClickDupe(data.exam_id); 
          }}>
          <i className="fa-solid fa-clone"></i>
          <span className="tooltip">Duplicate</span>
        </button>
        <button 
          className="teacher-home-delete-button"
          onClick={(e) => { 
            e.stopPropagation(); 
            onClickDel(data.exam_id); 
          }} 
        >
          <i className="fas fa-trash"></i>
          <span className="tooltip">Delete</span>
        </button>
      </div>
        
      <div className="exam-content">
        <i className="fas fa-folder"></i>
        <span>{title}</span>
      </div>

      <div className="taskbar">
        <div className="taskbar-left"></div> {/* None */}
        <div className="taskbar-right">Status: <span className="done-text">{status}</span></div>
      </div>

    </div>
  );
};

function CompletedExams({ exams, onClickDel, onClickDupe, className }) {
  const navigate = useNavigate();
  return (
    <>
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
          onClickNav={(e) => e.stopPropagation()}
        />
      ))}
    </>
  )
}

export default CompletedExams;







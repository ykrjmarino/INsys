import Button from '../../components/Buttons.jsx'
import { useNavigate } from "react-router-dom";

export const HomeCard = ({ data, title, examCode, status, onClickDel, onClickDupe }) => {

  return (
    <>
    <div className="grid-item"
      onClick={(e) => e.stopPropagation()}
      style={{ pointerEvents: "none", opacity: 0.8, cursor: "not-allowed" }}
    > {/*goes to the specific exam when div is clicked */}

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
        <div class="teacher-home-illustation">
          <p className="overlay-text">{title}</p>
          <img src="tryyy.jpg" alt="Exam container pic"></img>
        </div>
      </div>

      <div className="taskbar">
        <div className="taskbar-left">Code: <span className="done-text">{examCode}</span></div> 
        <div className="taskbar-right">Status: <span className="done-text">{status}</span></div>
      </div>
      
    </div>
    </>
  );
};

function OngoingExams({ exams, onClickDel, onClickDupe, className }) {
  const navigate = useNavigate();
  return (
    <>
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
          onClickNav={() => navigate(`/update-exam/${e.exam_id}`)}
        />
      ))}
    </>
  )
}

export default OngoingExams;

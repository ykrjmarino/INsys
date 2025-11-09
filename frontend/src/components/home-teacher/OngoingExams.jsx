import Button from '../../components/Buttons.jsx'
import { useNavigate } from "react-router-dom";

export const HomeCard = ({ data, title, examCode, status, onClickDel, onClickDupe }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  return (
    <>
    <div className="grid-item" onClick={(e) => e.stopPropagation()} > 
      <div className="teacher-home-grid-item-buttons" >
        <button 
          className="teacher-home-duplicate-button"
          onClick={(e) => { 
            e.stopPropagation(); 
            setShowConfirm(true);
            // onClickDupe(data.exam_id); 
          }}>
          <i className="fa-solid fa-clone"></i>
          <span className="tooltip">Duplicate</span>
        </button>
        <button 
          className="teacher-home-delete-button"
          onClick={(e) => { 
            e.stopPropagation(); 
            setShowDelete(true);
            // onClickDel(data.exam_id); 
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
    
      {showConfirm && (
        <div className="admins-exam-modal" onClick={() => setShowConfirm(false)}>
          <div className="admins-exam-modal-container" onClick={(e) => e.stopPropagation()}>
            <h4 className="admins-exam-modal-title">Duplicate Exam</h4>
            <p className="admins-exam-modal-text">
              Do you want to duplicate this exam?
            </p>
            <div className="admins-exam-modal-buttons">
              <button
                className="confirm"
                onClick={() => {
                  onClickDupe(data.exam_id);
                  setShowConfirm(false);
                }}
              >
                Yes, Duplicate
              </button>
              <button
                className="cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="admins-exam-modal" onClick={() => setShowDelete(false)}>
          <div className="admins-exam-modal-container" onClick={(e) => e.stopPropagation()}>
            <h4 className="admins-exam-modal-title">Confirm Delete</h4>
            <p className="admins-exam-modal-text">
              Do you want to delete this exam? This action cannot be undone.
            </p>
            <div className="admins-exam-modal-buttons">
              <button
                className="delete"
                onClick={() => {
                  onClickDel(data.exam_id);
                  setShowDelete(false);
                }}
              >
                Delete
              </button>
              <button
                className="cancel"
                onClick={() => setShowDelete(false)}
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

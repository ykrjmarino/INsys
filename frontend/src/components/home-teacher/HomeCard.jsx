import { useState } from "react";

function HomeCard ({ data, title, examCode, status, onClickNav, onClickDel, onClickDupe, onClickArch }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  return (
    <>
    
    <div className="grid-item"
      onClick={onClickNav}> {/* goes to the specific exam when div is clicked */}

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
            setShowArchive(true)
            // setShowDelete(true);
            // onClickDel(data.exam_id); 
          }} 
        >
          <i className="fas fa-trash"></i>
          <span className="tooltip">Archive</span>
        </button>
      </div>
        
      <div className="exam-content">
        <div className="diagonal-cross-grid"></div>
        <div className="teacher-home-illustation">
          <p className="overlay-text">{title}</p>
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

      {showArchive && (
        <div className="admins-exam-modal" onClick={() => setShowArchive(false)}>
          <div className="admins-exam-modal-container" onClick={(e) => e.stopPropagation()}>
            <h4 className="admins-exam-modal-title">Confirm Archive</h4>
            <p className="admins-exam-modal-text">
              Do you want to archive this exam?
            </p>
            <div className="admins-exam-modal-buttons">
              <button
                className="archive"
                onClick={() => {
                  onClickArch(data.exam_id)
                  setShowArchive(false);
                  // onClickDel(data.exam_id);
                  // setShowDelete(false);
                }}
              >
                Archive
              </button>
              <button
                className="cancel"
                onClick={() => setShowArchive(false)}
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

export default HomeCard;
import React, {useState} from "react";

import Button from '../../components/Buttons.jsx'
import InputField from '../../components/InputFields.jsx'


function Essay({ questionId, questionText, points, onSave, defaultEditing = true }) {
  const [editQuestion, setEditQuestion] = useState(questionText || "");
  const [editPoints, setEditPoints] = useState(points || 1);
  const questionType = 'essay';

  const [isEditing, setIsEditing] = useState(defaultEditing);

  const handleClick = () => {
    if (isEditing) {
      if (!editQuestion.trim()) {
        alert("Please fill in all fields.");
        return;
      }
      onSave({
        questionId: questionId,
        questionText: editQuestion,
        questionType: questionType,
        points: editPoints,
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
    <div className="essay-container">
      <div class = "points-save">
        <div  class ="exam-point-input">
          <label>points</label>
          <InputField className="points" 
            type="number"
            name="points"
            value={editPoints}
            min={1}
            onChange={(e) => setEditPoints(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={!isEditing}
          />
        </div>
        <button
          onClick={handleClick}
          className="save-button" 
          title={isEditing ? "Save" : "Edit"}
        >
          <i className={isEditing ? "fa-solid fa-floppy-disk" : "fa-solid fa-pen-to-square"}></i>
        </button>
        {/* <Button className="save-button" label={isEditing ? "Save" : "Edit"} onClick={handleClick} /> <br /> */}
      </div>
      
      <textarea className="exambox"
        name="question"
        value={editQuestion}
        onChange={(e) => setEditQuestion(e.target.value)}
        placeholder="Type the question here"
        disabled={!isEditing}
      />
    </div>
    </>
    
    );
}

export default Essay;
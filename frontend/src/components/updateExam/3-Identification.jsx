import React, {useState} from "react";

import Button from '../../components/Buttons.jsx'
import InputField from '../../components/InputFields.jsx'


function Identification({ questionId, questionText, correctAnswer, points, onSave, defaultEditing = true }) {
  const [editQuestion, setEditQuestion] = useState(questionText || "");
  const [editAnswer, setEditAnswer] = useState(correctAnswer || "");
  const [editPoints, setEditPoints] = useState(points || 1);
  const questionType = 'identification';

  const [isEditing, setIsEditing] = useState(defaultEditing);

  const handleClick = () => {
    if (isEditing) {
      if (!editQuestion.trim() || !editAnswer.trim()) {
        alert("Please fill in all fields.");
        return;
      }
      onSave({ //camelCase, POST(req.body), we are not GETting
        questionId: questionId,
        questionText: editQuestion,
        questionType: questionType,
        correctAnswer: editAnswer,
        points: editPoints,
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
    <div className="identification-container">
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
        {/* <Button className="save-button" label={isEditing ? "Save" : "Edit"} onClick={handleClick} /> */}
      </div>
      
      <textarea className="exambox"
        name="questionText"
        value={editQuestion}
        onChange={(e) => setEditQuestion(e.target.value)}
        placeholder="Type the question here"
        disabled={!isEditing}
      />
      <label className="choices-label">Identification:</label> 
      <InputField className="identification-input"
        name="correctAnswer"
        value={editAnswer}
        onChange={(e) => setEditAnswer(e.target.value)}
        placeholder="Enter Answer"
        disabled={!isEditing}
        autoComplete="off"
      />
    </div>
    </>
    );
}

export default Identification;
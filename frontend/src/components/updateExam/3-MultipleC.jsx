import React, {useState} from 'react'

import Button from '../Buttons.jsx'
import InputField from '../InputFields.jsx'

function MultipleChoice({ questionId, questionText, options, correctAnswer, points, onSave, defaultEditing = true }) {
  const [editQuestion, setEditQuestion] = useState(questionText || "");
  const [choices, setChoices] = useState(options || ['', '', '', '']);
  const [editAnswer, setEditAnswer] = useState(correctAnswer || "");
  const [editPoints, setEditPoints] = useState(points || 1);
  const questionType = 'multiplechoice';
  
  const [isEditing, setIsEditing] = useState(defaultEditing);

  const handleClick = () => {
    if (isEditing) {
      if (!editQuestion.trim() || !editAnswer.trim()) {
        alert("Please fill in all fields.");
        return;
      }
      if (!choices.includes(editAnswer)) {
        alert("Answer should be one of the choices");
        return;
      }

      onSave({
        questionId: questionId,
        questionText: editQuestion,
        questionType: questionType,
        options: choices,
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
    <div className="nested-container">
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
      
      {/* INPUTING WRONG CHOICES/OPTIONS*/}
      <label className="choices-label">Choices:</label>
      <div className="option-inputs"> {/* only options here */}
        {choices.map((choice, index) => (
          <InputField
            key={index}
            className="option-input"
            name={`option${index}`}
            value={choice}
            onChange={(e) => {
              const updated = [...choices];
              updated[index] = e.target.value;
              setChoices(updated);
            }}
            placeholder={`Option ${index + 1}`}
            disabled={!isEditing}
          />
        ))}
      </div>
      <label className="correct-answer-label">Correct Answer:</label>
      {/* INPUTING THE ACTUAL RIGHT ANSWER*/}
      <InputField className="correct-answer-input"
        name="correctAnswer"
        value={editAnswer}
        onChange={(e) => setEditAnswer(e.target.value)}
        placeholder="Set Correct Answer"
        disabled={!isEditing}
      />
    </div>
    </>
  )
}
export default MultipleChoice;
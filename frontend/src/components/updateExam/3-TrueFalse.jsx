import React, {useState} from 'react'
import InputField from '../../components/InputFields';
import Button from '../../components/Buttons';
import SelectField from '../../components/SelectFields';

function TrueFalse({ questionId, questionText, options, correctAnswer, points, onSave, defaultEditing = true }) {
  const [editQuestion, setEditQuestion] = useState(questionText || "");
  const [choices, setChoices] = useState(options || ['True', 'False']);
  const [editAnswer, setEditAnswer] = useState(correctAnswer || "True");
  const [editPoints, setEditPoints] = useState(points || 1);
  const questionType = 'truefalse';

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
    <div className="tf-container">
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
        {/* <Button className="save-button" label={isEditing ? "Save" : "Edit" } onClick={handleClick} /> */}
      </div>
      
      <textarea className="exambox"
        name="questionText"
        value={editQuestion}
        onChange={(e) => setEditQuestion(e.target.value)}
        placeholder="Type the question here"
        disabled={!isEditing}
      />
      <br/>
      <label clasName="choices-label">True or False:</label>
      <select className="tf-dropdown"
        name="truefalse"
        value={editAnswer}
        onChange={(e) => setEditAnswer(e.target.value)}
        disabled={!isEditing} 
      >
        <option value="True">True</option>
        <option value="False">False</option>
      </select>
    </div>
    </>
  )
}

export default TrueFalse;
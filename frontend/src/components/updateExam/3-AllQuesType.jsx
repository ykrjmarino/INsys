import React, { useState, useEffect } from "react";

import Identification from "./3-Identification";
import MultipleChoice from "./3-MultipleC";
import TrueFalse from "./3-TrueFalse";
import Essay from "./3-Essay";
import SelectField from "../../components/SelectFields";

const questionTypes = [
  { label: "Identification", value: "identification" },
  { label: "Multiple Choice", value: "multiplechoice" },
  { label: "True or False", value: "truefalse" },
  { label: "Essay", value: "essay" }
];

export const EditableQuestionForm = ({ data, onSave, onDelete, defaultEditing = false }) => { //editing existing questions in the database
  const [type, setType] = useState(data.question_type);
  const [formData, setFormData] = useState(data);

  const [isEditing, setIsEditing] = useState(defaultEditing);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (newType !== type) {
      if (confirm("⚠️ Changing question type will reset current fields. Proceed?")) {
        setType(newType);
        setIsEditing(true);
        setFormData({
          question_id: data.question_id,
          question_type: newType,
          question_text: '',
          correct_answer: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          points: 1
        });
      }
    }
  };

  const optionsArray = [
    formData.option_a,
    formData.option_b,
    formData.option_c,
    formData.option_d,
  ];

  const commonProps = { //from DB so snake_case
    questionId: formData.question_id,
    questionText: formData.question_text,
    questionType: formData.question_type,
    correctAnswer: formData.correct_answer,
    options: optionsArray,
    points: formData.points,
    onSave: onSave,
    defaultEditing: isEditing,
  };

  return (
    <>
      <label className="question-type-label">Question Type:</label>
      <SelectField
        className="question-type-dropdown"
        name="questionType"
        value={type}
        onChange={handleTypeChange}
        options={questionTypes}
      />
      <div className="button-group">
        <button className="delete-button" onClick={() => onDelete(data.question_id)}>Delete</button>
      </div>
      
      {type === "identification" && (
        <>
          <Identification {...commonProps} />
        </>
        )}
      {type === "multiplechoice" && (
        <>
        <MultipleChoice {...commonProps} />
        </>        
      )}
      {type === "truefalse" && (
        <>
        <TrueFalse {...commonProps}/>
        </>
      )}
      {type === "essay" && (
        <>
          <Essay {...commonProps} />
        </>
      )}
    </>
  );
}











export const QuestionAdd = ({ onClick }) => {
  return (
    <button className="add-question-button" onClick={onClick}>
      <i className="fa-solid fa-plus"></i> Add Question
    </button>
  );
}



function AddQuestionForm({ exam, onSave, formId, defaultEditing = false  }) { //adding new questions 
  const [selectedType, setSelectedType] = useState("identification");
  const [prevType, setPrevType] = useState("identification");
  const [questionData, setQuestionData] = useState({});

  const [isEditing, setIsEditing] = useState(defaultEditing);

  //reset data when type changes
  useEffect(() => {
    setQuestionData({});
  }, [selectedType]);

  const handleQuesTypeChange = (e) => {
    const newType = e.target.value;

    const hasInput = Object.keys(questionData).length > 0; //{"question_text", "options", "etc"} or {}

    if (newType !== selectedType && hasInput) {
      const confirmed = window.confirm(
        "Changing question type will clear the current form. Continue?"
      );

      if (confirmed) {
        setSelectedType(newType);
        setPrevType(newType);
        setQuestionData({});
        setIsEditing(true);
      } else {
        setSelectedType(prevType);
      }
    } else {
      setSelectedType(newType);
      setPrevType(newType);
      setQuestionData({});
    }
  };

  const commonProps = {
    exam, //full exam info
    id: formId, //exam id
    onSave: (data) => {
      const dataAndType = { ...data, questionType: selectedType };
      setQuestionData(dataAndType);
      onSave(dataAndType); //call parent AXIOS POST
    },
    data: questionData,
  };


  return (
    <>
      <label className="question-type-label">Question Type:</label>
      <SelectField
        className="question-type-dropdown"
        name="questionType"
        value={selectedType}
        onChange={handleQuesTypeChange}
        options={[
          { label: "Identification", value: "identification" },
          { label: "Multiple Choice", value: "multiplechoice" },
          // { label: "True or False", value: "truefalse" },
          { label: "Essay", value: "essay" }
        ]}
      />

      {selectedType === "identification" && (
        <>
          <Identification {...commonProps} />
        </>
        )}
      {selectedType === "multiplechoice" && (
        <>
        <MultipleChoice {...commonProps} />
        </>        
      )}
      {selectedType === "truefalse" && (
        <>
        <TrueFalse {...commonProps}/>
        </>
      )}
      {selectedType === "essay" && (
        <>
          <Essay {...commonProps} />
        </>
      )}
    </>
  );
}

export default AddQuestionForm;


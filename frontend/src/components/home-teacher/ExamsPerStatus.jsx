import { useState } from 'react';
import Button from '../Buttons.jsx'
import { useNavigate } from "react-router-dom";
import HomeCard from './HomeCard.jsx';


function DraftExams ({ exams, onClickDel, onClickDupe, className, onClickArch }) {
  const navigate = useNavigate();
  return (
    <>
      {exams.map((e) => (
        <HomeCard //these from the database so use snake_case
          className={className}
          key={e.exam_id}
          title={e.title}
          examCode={e.exam_code}
          status={e.status}
          sections={e.sections}
          data={e}
          onClickDel={onClickDel} //send to: const handleDeleteExam = (examId)=>{}
          onClickDupe={onClickDupe}
          onClickNav={() => navigate(`/update-exam/${e.exam_id}`)}
          onClickArch={onClickArch}
        />
      ))}
    </>
  )
}

export const PublishedExams = ({ exams, onClickDel, onClickDupe, className, onClickArch }) => {
  const navigate = useNavigate();
  return (
    <>
      {exams.map((e) => (
        <HomeCard //these from the database so use snake_case
          className={className}
          key={e.exam_id}
          title={e.title}
          examCode={e.exam_code}
          status={e.status}
          sections={e.sections}
          data={e}
          onClickDel={onClickDel} //send to: const handleDeleteExam = (examId)=>{}
          onClickDupe={onClickDupe}
          onClickNav={() => navigate(`/update-exam/${e.exam_id}`)}
          onClickArch={onClickArch}
        />
      ))}
    </>
  )
}


export const OngoingExams = ({ exams, onClickDupe, className, onClickArch  }) => {
  const navigate = useNavigate();
  return (
    <>
      {exams.map((e) => (
        <HomeCard //these from the database so use snake_case
          className={className}
          key={e.exam_id}
          title={e.title}
          examCode={e.exam_code}
          status={e.status}
          sections={e.sections}
          data={e}
          // onClickDel={onClickDel}
          onClickDupe={onClickDupe}
          onClickNav={(e) => e.stopPropagation()}
          onClickArch={onClickArch}
        />
      ))}
    </>
  )
}

export const CompletedExams = ({ exams, onClickDel, onClickDupe, className, onClickArch }) => {
  return (
    <>
      {exams.map((e) => (
        <HomeCard //these from the database so use snake_case
          className={className}
          key={e.exam_id}
          title={e.title}
          examCode={e.exam_code}
          status={e.status}
          sections={e.sections}
          data={e}
          onClickDel={onClickDel} //send to: const handleDeleteExam = (examId)=>{}
          onClickDupe={onClickDupe}
          onClickNav={(e) => e.stopPropagation()}
          onClickArch={onClickArch}
        />
      ))}
    </>
  )
}

export default DraftExams;
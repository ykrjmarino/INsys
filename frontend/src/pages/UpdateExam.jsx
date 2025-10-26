import axios from '../utils/axiosConfig.js';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';

import SelectField from '../components/SelectFields.jsx';
import Button from '../components/Buttons.jsx';
import InputField from '../components/InputFields.jsx';

//updateExam folder
import SelectedSection from '../components/updateExam/2-Section.jsx';
import AddQuestionForm, { QuestionAdd, EditableQuestionForm } from '../components/updateExam/3-AllQuesType.jsx';
import ScheduledTakers from '../components/updateExam/2-Schedule.jsx';

function UpdateExam() {
  const { accessToken } = useAuth();
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questionForms, setQuestionForms] = useState([]);

  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);

  const [examInfo, setExamInfo] = useState(null); //title, code, stats, sched, sect
  const [examQues, setExamQues] = useState(null); //questions
  const [passingScore, setPassingScore] = useState('');


  useEffect(() => {
    if (!accessToken || !examId) return;
    fetchData();
  }, [examId, accessToken]);
  

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` }
      const config = {
        headers,
        withCredentials: true
      };

      const examInfo = await axios.get(`/exams/exam/${examId}`, config);
      const examQuestions = await axios.get(`/exams/${examId}/questions`, config);

      setExamInfo(examInfo.data);
      setExamQues(examQuestions.data);
      setPassingScore(examInfo.data.passing_score);
    } catch (err) {
      console.error("Error fetching exam data:", err);
    }
  };
  

  if (!examInfo) return <p>Loading exam... fetching exam info...</p>;
  if (!examQues) return <p>Loading exam... probably no questions yet...</p>;

  const handleQuestionAdd = async() => { //adds blank form just for displaying empty form UI 
    const newForm = { id: Date.now() };
    setQuestionForms((prev) => [...prev, newForm]);
  }

  const handleSaveExamInfo = async () => { //title, sections, wtvr
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      const updatedExamInfo = {
        ...examInfo,
        passing_score: passingScore,
      };
      await axios.patch(`/exams/${examId}/details`, updatedExamInfo, config);
      console.log("Exam info updated");
      console.log("PATCH payload:", updatedExamInfo);
      fetchData();
    } catch (err) {
      console.error("Failed to update exam info:", err);
    }
  };

  const handleRandomizeCode = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      await axios.patch(`/exams/${examId}/code`, config);
      console.log("Exam code updated");
      handleSaveExamInfo(); //call to refresh the code automatically
    } catch (err) {
      console.error("Failed to update exam code:", err);
    }
  }

  const handlePublish = async () => {
    const now = new Date();
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    let status;

    if(now < start) status = 'published';
    else if((now >= start) && (now < end)) status = 'ongoing';
    else status = 'completed';

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try { 
      await axios.patch(`/exams/${examId}/status`, {status: status}, config);

      console.log(`Exam status set to: ${status}`);
      navigate('/admin-dashboard');
    } catch (err) {
      console.error("Failed to publish exam:", err);
    }
  };







  const handleSaveQuestion = async(data) => { //save via axios //data is from allquestype
    console.log("Posting question:", data);
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    const questionId = Number.isInteger(data.questionId) ? data.questionId : null;

    try {
      console.log("print questionId:", data.questionId); 
      //will only print if we edit the existing question. undefined if it's a new  question, 
      //because questionId is from frontend, and we dont axios GET the data when we create, backend will handle the id creation.

      if (questionId) {//camelCase cuz it's from AllQuesType.jsx
        //if EXISTING --- UPDATE existing question
        console.log("Payload being sent:", { ...data, exam_id: examId });

        await axios.patch(`/exams/${examId}/questions/${questionId}`, { ...data, exam_id: examId }, config);
        
        //update in place instead of refetching para di magulo yung sequence na showing sa frontend
        setExamQues((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex(q => q.question_id === questionId);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], ...data }; // merge changes
            }
            return updated;
          });

        } else {
          //if NOT EXISTING --- POST create another question
          await axios.post(`/questions/${examId}`, { ...data, exam_id: examId }, config);

          //refetch and update questions from DB.. best practice
          const updatedQuestions = await axios.get(`/exams/${examId}/questions`, config);
          setExamQues(updatedQuestions.data);
        }
        //clear add form
        setQuestionForms([]);
    } catch (err) {
      console.error("Failed to create question:", err);
    }
  };

  const handleDeleteQuestion = async(questionId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      await axios.delete(`/exams/${examId}/questions/${questionId}`, config);
  
      const updatedQuestions = await axios.get(`/exams/${examId}/questions`, config);
      //refetch and update questions from DB.. best practice
      setExamQues(updatedQuestions.data);
      console.log('question deleted');
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  }


  return (
    <>
      <div className="ancestor">

        {/*<!-- 1 HEADER -->*/}
        <div className="header">
          <div className="left-group">
            <Button className="back-button-exam" label="&lt;" onClick={() => navigate(-1)} />
            <InputField 
              className="exam-title"
              name="title"
              type="text"
              value={examInfo.title}
              onChange={(e) => {
                setExamInfo({ ...examInfo, [e.target.name]: e.target.value });
              }}
              placeholder="Enter Title Exam"
            />
            <Button className="header-save-button" label="Save" onClick={handleSaveExamInfo} />
            <p className="exam-code" placeholder="Exam Code">{examInfo.exam_code}</p>
            <button className="randomize-button" onClick={handleRandomizeCode}><i className="fa-solid fa-arrow-rotate-left"></i></button>
          </div>

          <p>Total points: {examInfo.total_points}</p>
          <p>Passing score: 
            <input 
              type='number'
              value={passingScore}
              onChange={(e) => { //this is for limiting the typing sa score
                const value = e.target.value;

                // allow empty input
                if (value === '') {
                  setPassingScore('');
                  return;
                }

                const num = Number(value);

                // enforce limits manually
                if (num < 0) setPassingScore(0);
                else if (num > examInfo.total_points) setPassingScore(examInfo.total_points);
                else setPassingScore(num);
              }}
              min="0"
              max={examInfo.total_points}
            />
          </p>

        
          <p>Status: {examInfo.status}</p>
          <Button className="publish-button" disabled={examInfo.status === 'published'} label="Publish" onClick={handlePublish} />
        </div>
        

        {/*<!-- Div 2 -->*/}
        <div className="main-content">
          {/*<!-- Div 2.1 -->*/} {/*<!-- questions -->*/}
          <div className="question-container">
            <div className="question-box">
              {/* <label className="question-label">Question</label> */}
              {examQues.map((q) => (
                <EditableQuestionForm
                  key={q.question_id}
                  data={q}
                  onSave={handleSaveQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}
              {/* Adding of question FORM */}
              {questionForms.map((form) => (
                <AddQuestionForm
                  key={form.id}
                  formId={form.id}
                  exam={examQues}
                  setExam={setExamQues}
                  onSave={handleSaveQuestion}
                />
              ))}
            </div>
            <QuestionAdd onClick={handleQuestionAdd} />
          </div>

          {/*<!-- 2.2 tools -->*/}
          <div className="tools-container">
            <label className="tool-label">Tools</label>
            {/*<!-- 1 -->*/}
            <div className="select-container">
              <SelectedSection />
            </div>

            {/*<!-- 2 -->*/}
            <div className="set-time-container">
              <ScheduledTakers
                setStartDateTime={setStartDateTime}
                setEndDateTime={setEndDateTime}
              />
            </div>
            {/*<!-- 3 -->*/}
            <div className="display-date-container">
              <label className="select-label">Selected Time</label>
              <div className="date-time-group">
                <label className="date-time-label">Start Date/Time: {startDateTime || "—"}
                <br/>
                </label>
                <label className="date-time-label">End Date/Time: {endDateTime || "—"}</label>
              </div>
            </div>
          </div> {/* tool content */}
        </div> {/* main content */}
          

      </div>
    </>
  );
}

export default UpdateExam;
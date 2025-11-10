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
      handleSaveExamInfo();
      
      await axios.patch(`/exams/${examId}/status`, {status: status}, config);

      console.log(`Exam status set to: ${status}`);
      navigate('/admin-dashboard');
    } catch (err) {
      console.error("Failed to publish exam:", err);
    }
  };







  const handleSaveQuestion = async (data) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    const questionId = Number.isInteger(data.questionId) ? data.questionId : null;

    try {
      let updatedQuestions;

      if (questionId) {
        // UPDATE existing question
        await axios.patch(`/exams/${examId}/questions/${questionId}`, { ...data, exam_id: examId }, config);

        updatedQuestions = examQues.map(q => q.question_id === questionId ? { ...q, ...data } : q);

      } else {
        // CREATE new question
        const res = await axios.post(`/questions/${examId}`, { ...data, exam_id: examId }, config);
        updatedQuestions = [...examQues, res.data]; // add new question
      }

      // Recalculate total points
      const totalPoints = updatedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

      // PATCH total_points to backend
      await axios.patch(`/exams/${examId}/details`, { total_points: totalPoints }, config);

      // Update frontend state
      setExamQues(updatedQuestions);
      setExamInfo(info => ({
        ...info,
        total_points: totalPoints,
        passing_score: Math.min(info.passing_score, totalPoints)
      }));

      // Clear add form
      setQuestionForms([]);

    } catch (err) {
      console.error("Failed to save question:", err);
    }
  };

  const handleDeleteQuestion = async(questionId) => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    };

    try {
      await axios.delete(`/exams/${examId}/questions/${questionId}`, config);

      const updatedQuestions = examQues.filter(q => q.question_id !== questionId);
      setExamQues(updatedQuestions);

      const totalPoints = updatedQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
      const newPassingScore = Math.min(passingScore, totalPoints);

      setExamInfo(info => ({
        ...info,
        total_points: totalPoints,
        passing_score: newPassingScore
      }));
      setPassingScore(newPassingScore);

      await axios.patch(`/exams/${examId}/details`, {
        total_points: totalPoints,
        passing_score: newPassingScore
      }, config);

      console.log('Question deleted and total points updated');
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  }


  return (
    <>
      <div className="ancestor">

        {/*<!-- 1 HEADER -->*/}
        <div className="header-create">
          <div className="left-group">
            <button className="back-button-exam" onClick={() => navigate(-1)}><i className="fa-solid fa-arrow-left"></i></button>
            <InputField 
              className="exam-title"
              id="exam-title-input"
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
          
          <div className="create-right-group">
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
          
        </div>
        

        {/*<!-- Div 2 -->*/}
        <div className="main-content">
          {/*<!-- Div 2.1 -->*/} {/*<!-- questions -->*/}
          <div className="question-container">
            <div className="create-labels">Questions</div>
            
            <div className="question-box">
              {examQues.map((q) => (
                <div className="question-card" key={q.question_id}>
                  <EditableQuestionForm
                    data={q}
                    onSave={handleSaveQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                </div>
              ))}
              {/* Adding of question FORM */}
              {questionForms.map((form) => (
                <div className="question-card" key={form.id}>
                  <AddQuestionForm
                    formId={form.id}
                    exam={examQues}
                    setExam={setExamQues}
                    onSave={handleSaveQuestion}
                  />
                </div>
              ))}
            </div>
            <QuestionAdd onClick={handleQuestionAdd} />
          </div>

          {/*<!-- 2.2 tools -->*/}
          <div className="tools-container">
            <label className="create-labels-tools">Tools</label>
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
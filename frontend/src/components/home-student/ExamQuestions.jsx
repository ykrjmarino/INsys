import axios from "../../utils/axiosConfig";
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import RadioButtonOptions from "../RadioButtonOptions";
import InputField from "../InputFields"
import SelectField from "../SelectFields";
import Button from "../Buttons"
import { FinishExamInfo } from "./FinishExamInfo";
import { ResizeMonitor, TabMonitor } from "../Monitoring";


const MultiChoiceComp = ({mcqText, mcqOptions, name, divClassName, onChange, value}) => {
  return (
    <>
      <div className="student-exam-container">
        <div className="student-exam-box">
          <p>{mcqText}</p>
        </div>

        <RadioButtonOptions
          name={name}
          value={value}
          onChange={onChange}
          options={mcqOptions}
          divClassName = "student-exam-option-container"
          divClassName2="option-pair"
        />
      </div>
    </>
  )
}

const IdentificationComp = ({idenText, name, divClassName, placeholder, onChange, value}) => {
  return (
    <>
      <div className="student-exam-container-identification">
        <div className="student-exam-box-identification">
          <p>{idenText}</p>
        </div>

        <div className="student-exam-option-container-identification">
          <InputField 
            className="student-exam-input-identification" 
            name={name}
            value={value || ""} //must be string or number
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  )
}

const EssayComp = ({essayText, name, divClassName, placeholder, onChange, value}) => {
  return (
    <>
      <div className="student-exam-container-essay">
        <div className="student-exam-box-essay">
          <p>{essayText}</p>
        </div>

        <div className="student-exam-option-container-essay">
          <textarea
            className="student-exam-input-essay" 
            id="student-exam-identification-essay" 
            name={name} 
            value={value || ""} //must be string or number
            onChange={onChange}
            placeholder="Enter your essay answer" 
            rows="10" />
        </div>
      </div>
    </>
  )
}

const TrueFalseComp = ({tfText, tfOptions, name, divClassName, onChange, value}) => {
  return (
    <>
      <div className="student-exam-container-tf">
        <div className="student-exam-box-tf">
          <p>{tfText}</p>
        </div>
        <div>
          <RadioButtonOptions
            name={name}
            value={value}
            onChange={onChange}
            options={tfOptions}
            divClassName="student-exam-option-container-tf"
            divClassName2="student-exam-button option-pair-tf"
          />
        </div>
      </div>
    </>
  )
}


function ExamQuestions() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const { examId } = useParams(); //not params.,, dapat galing sa code
  const [examQuestions, setExamQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [examSession, setExamSession] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingExamInfo, setLoadingExamInfo] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [examInfo, setExamInfo] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [timerLeft, setTimerLeft] = useState(0);

useEffect(() => {
  if (!examInfo?.timer_question || !examQuestions[current]) return;

  const questionKey = `exam-${examId}-q-${current}-startTime`;

  // Load or initialize startTime for this question
  let startTime = localStorage.getItem(questionKey);
  if (!startTime) {
    startTime = Date.now();
    localStorage.setItem(questionKey, startTime);
  } else {
    startTime = Number(startTime);
  }

  const totalTime = examInfo.timer_question * 1000;

  const updateTimer = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(totalTime - elapsed, 0);
    setTimerLeft(Math.floor(remaining / 1000));
  };

  // Update immediately
  updateTimer();

  // Interval for countdown
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(totalTime - elapsed, 0);
    setTimerLeft(Math.floor(remaining / 1000));

    if (remaining <= 0) {
      clearInterval(interval);
      localStorage.removeItem(questionKey);
      // Only auto-submit current question
      handleStudentAnswer();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [examInfo, current]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      }; 
      try {
        const res = await axios.get(`/exams/unanswered/${examId}`, config);
        //this will give us res.status(200).json({ objectives: objectives.rows, essays: essays.rows });

        const combined = [...res.data.objectives, ...res.data.essays];

        if ((!res.data.objectives || res.data.objectives.length === 0) && (!res.data.essays || res.data.essays.length === 0)){//if no questions left
          fetchExamInfo();
          setSubmitted(true);
          return; // stop further execution
        }

        setExamQuestions(combined);
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Something went wrong in fetchQuestions");
      } finally {
        setLoadingQuestions(false);
      }
    } 
    const fetchSession = async () => {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      }; 
      try {
        const res = await axios.get(`/exams/session/${examId}`, config);

        setExamSession(res.data.status);
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Something went wrong in fetchSession");
      }
    }

    fetchQuestions(); 
    fetchSession();
    fetchExamInfo();
  }, [examId]);

  useEffect(() => {
    const handleCopy = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const exitExam = async() => {
    const confirmExit = window.confirm("Are you sure you want to exit? Your answers will be submitted automatically.");
    if (confirmExit) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true
        };

        await axios.post(`/student/exams/${examId}/submit`, { examId }, config);
      } catch (error) {
        console.log(
        error.response?.data?.error ||
        error.response?.data ||
        error.message
        );
        alert(error.response?.data?.error || "Failed to submit = true");
      }
      navigate(-1);
    }
  }

  const fetchExamInfo = async() => {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true
    }; 

    setLoadingExamInfo(true);
    try {
      const res = await axios.get(`/student/exams/${examId}/info`, config); //getInfoPerExam
      setExamInfo(res.data);
      setTimerLeft(res.data.timer_question || 0);

    } catch (error) {
      console.log(
        error.response?.data?.error ||
        error.response?.data ||
        error.message
      );
      alert(error.response?.data?.error || "Something went wrong in getting fetchExamInfo");
    } finally {
      setLoadingExamInfo(false);
    }
  }

  useEffect(() => {
    if (!loadingQuestions && examSession === 'in-progress' && examQuestions.length === 0) {
      fetchExamInfo();   // get exam details
      setSubmitted(true);
    }
  }, [loadingQuestions, examQuestions, examSession]);

  //nasa render logic to: return(...)
  // const optionsArrayMCQ = [
  //   examQuestions[current].option_a,
  //   examQuestions[current].option_b,
  //   examQuestions[current].option_c,
  //   examQuestions[current].option_d,
  // ];

  // const optionsArrayTF = [
  //   examQuestions[current].option_a,
  //   examQuestions[current].option_b
  // ];

  const handleStudentAnswer = async() => { //adds blank form just for displaying empty form UI 
    const currentQuestion = examQuestions[current];

    try {
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      };

//  questionId (nasa backend na), studentSchoolId, studentAnswer, examId  //
      await axios.post(`/student-answers/${examId}/submit`, {
        examId,
        questionId: currentQuestion.question_id,
        studentAnswer: selectedAnswer
      }, config);

      console.log("student answer saved to DB... save student_answers table");
      //clear answer for next question
      setSelectedAnswer('');
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save answer");
    }
  }

  const q = examQuestions.length > 0 ? examQuestions[current] : null;  //will use in return(...) for shortcut

  useEffect(() => {
    if (timerLeft <= 0) return; // stop if no time

    const interval = setInterval(() => {
      setTimerLeft(prev => prev - 1); // subtract 1 each second
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [timerLeft]);

  return (
    <>
    <ResizeMonitor 
      examId={examId}
    />
    <TabMonitor 
      examId={examId}
    />
    {/* <FaceMonitor 
      examId={examId} 
    /> */}


    {submitted ? (
      <div>
        {loadingExamInfo ? ( <p>Loading exam questions...</p>) : examInfo ? (
        <FinishExamInfo 
          examTitle={examInfo.title}
          examAutomatedScore={examInfo.total_score}
          examTotalPoints={examInfo.total_points}
          examTotalQuestions={examInfo.total_questions}
        />
        ) : (
          <p>No exam info found.</p>
        )}
      </div>
    ): ( 
            //if no question remains (anu hah):(navigate to exam score/details page)
      <>
      <div className="student-exam-whole">
        <div className="student-exam-back">
          <button onClick={exitExam}>&lt;</button>
          {/* <h2>Question {current + 1}</h2>  */}
            <div className="exam-timer">
              <h2>Time left: {timerLeft}s</h2>
            </div>
        </div>

        {!submitted && q && (
          <>
            {/* console.log(optionsArray) */}
            {/* console.log(selectedAnswer) */}
          
            {(() => {
              const optionsArrayMCQ = [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
              ];

              const optionsArrayTF = [
                q.option_a,
                q.option_b,
              ];

              switch (q.question_type) { //question-type here
                case "multiplechoice":
                  return (
                    <MultiChoiceComp 
                      mcqText={q.question_text}
                      mcqOptions={optionsArrayMCQ}
                      name={`q${current}`} 
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    />
                  )
                case "identification":
                  return (
                    <IdentificationComp
                      idenText={q.question_text}
                      name={`q${current}`} 
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                       placeholder="Enter your answer"
                    />
                  )
                case "essay":
                  return (
                    <EssayComp
                      essayText={q.question_text}
                      name={`q${current}`}
                      value={selectedAnswer || ""} 
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      placeholder="Enter your essay answer"
                    />
                  )
                case "truefalse":
                  return (
                    <TrueFalseComp 
                      tfText={q.question_text}
                      tfOptions={optionsArrayTF}
                      name={`q${current}`} 
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                    />
                  )
                default: 
                  return null;
              }
            })()}
          </>
        )}
        <div className="student-exam-button-container">
          {/*q might be null if examQuestions empty*/}
          {/* <button
            disabled={current === 0}
            onClick={() => setCurrent((prev) => prev - 1)}
          >
            Previous
          </button> */}
          <Button 
            label={current === examQuestions.length - 1 ? "Submit" : "Next"}
            onClick={async() => {
              // Save current answer
              await handleStudentAnswer();

              // Clear previous question timer from localStorage
              const prevQuestionKey = `exam-${examId}-q-${current}-startTime`;
              localStorage.removeItem(prevQuestionKey);
              
              if (current === examQuestions.length - 1) { 
                //(array minus 1) is the last object
                //fetch exam info -> triggers showing FinishExamInfo
                await fetchExamInfo();
                setSubmitted(true);
              } else {
                const nextQuestionIndex = current + 1;
                setCurrent(nextQuestionIndex);
                // Reset timer for the next question
                setTimerLeft(examInfo.timer_question);

                // Remove any existing startTime for the next question
                const nextQuestionKey = `exam-${examId}-q-${nextQuestionIndex}-startTime`;
                localStorage.removeItem(nextQuestionKey);
              }
            }}  
          />
        </div>
      </div>
      </>
    )}
    
    </>
  )
}

export default ExamQuestions;
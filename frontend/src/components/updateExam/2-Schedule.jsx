import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom'
import axios from "../../utils/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';

import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const TimePickerComponent = ({ value, onChange }) => {
return (
    <>
      <style>
        {`
          /* make AM/PM sit beside the time */
          .react-time-picker__inputGroup {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .react-time-picker__inputGroup__amPm {
            margin-left: 4px;
            align-self: center;
          }

          /* basic styling */
          .react-time-picker__wrapper {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 4px 6px;
            background-color: #fff;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .react-time-picker__inputGroup__input {
            font-size: 14px;
            width: 40px;
            text-align: center;
          }

          .react-time-picker {
            font-family: Inter, sans-serif;
          }
        `}
      </style>

      <TimePicker
        value={value}
        onChange={onChange}
        disableClock={true}
        clearIcon={null}
        clockIcon={null}
        format="hh:mm a"
      />
    </>
  );
};


function ScheduledTakers({ setStartDateTime, setEndDateTime }) { //nasa UpdateExam yuing dalawang to, so i can get it out here
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("06:45");
  const [durationHours, setDurationHours] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(0);

  //LocaleString display-friendly version
  // const [startDateTime, setStartDateTime] = useState("");
  // const [endDateTime, setEndDateTime] = useState("");
    //toLocaleString() === 8/12/2025, 9:15:00 AM

  const [questionMinutes, setQuestionMinutes] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);

  //ISO format for DB
  const [startDateTimeISO, setStartDateTimeISO] = useState("");
  const [endDateTimeISO, setEndDateTimeISO] = useState("");
    //.toISOString() === 2025-08-12T01:15:00.000Z

  const { examId } = useParams();
  const { accessToken } = useAuth();
  const headers = { Authorization: `Bearer ${accessToken}` }
  const config = { headers, withCredentials: true };



/* =========== FETCH AND RENDER THE DATE ========== */
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`/exams/${examId}/schedule`, config); 

        //convert UTC to local time
        const utcDate = new Date(res.data.start_datetime);
        const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
        setStartDate(localDate.toISOString().split("T")[0]);
        setStartTime(localDate.toISOString().split("T")[1].slice(0, 5));

        if (!res.data || !res.data.start_datetime) {
          const now = new Date();
          setStartDate(now.toISOString().split("T")[0]);
          setStartTime(now.toTimeString().slice(0, 5));
        }
        
        if (res.data.exam_duration !== undefined) {
          const totalMinutes = Number(res.data.exam_duration);
          setDurationHours(Math.floor(totalMinutes / 60));
          setDurationMinutes(totalMinutes % 60);
        }

        if (res.data.timer_question) {
          const totalSeconds = Number(res.data.timer_question);
          setQuestionMinutes(Math.floor(totalSeconds / 60));
          setQuestionSeconds(totalSeconds % 60);
        } else {
          setQuestionMinutes(0);
          setQuestionSeconds(0); //display empty timer
        }
      } catch (err) {
        console.error("Error fetching saved date", err);
      }
    };
    if (examId) fetchSchedule();
  }, [accessToken, examId])

/* ====== CALCULATE END DATE/TIME (INPUT CHANGE) ====== */
  useEffect(() => {
    if (!startDate || !startTime) return;

    const [hours, minutes] = startTime.split(":").map(Number);
    const start = new Date(startDate); //start.toISOString()
    start.setHours(hours, minutes, 0, 0);

    setStartDateTime(start.toLocaleString()); 
    setStartDateTimeISO(start.toISOString()); 

    const end = new Date(start);
    end.setHours(end.getHours() + Number(durationHours));
    end.setMinutes(end.getMinutes() + Number(durationMinutes));
    
    setEndDateTime(end.toLocaleString());
    setEndDateTimeISO(end.toISOString());

    //for backend convertion hrs to mins 
    const totalMinutes = Number(durationHours) * 60 + Number(durationMinutes); //1hr = 60mins


                    console.log({
                      scheduledDate: start.toISOString(),
                      addExamDuration: totalMinutes,
                    });

  }, [startDate, startTime, durationHours, durationMinutes, accessToken]);

/* =========== SAVE DATE ========== */
  const handleSave = async () => {
    if (!startDate || !startTime) {
      console.error("Missing data to save schedule");
      return;
    }

    const [hours, minutes] = startTime.split(":").map(Number);
    const start = new Date(startDate);
    start.setHours(hours, minutes, 0, 0);

    const totalMinutes = Number(durationHours) * 60 + Number(durationMinutes);
    const totalQuestionSeconds = Number(questionMinutes) * 60 + Number(questionSeconds);

    try {
      await axios.put(`/exams/${examId}/schedule`, {
        scheduledDate: start.toISOString(),
        addExamDuration: totalMinutes,
        questionTimer: totalQuestionSeconds,
      }, config);
      console.log("Saved schedule!");
      toast.success("Saved schedule!");
    } catch (err) {
      toast.error("Failed to save schedule: ", err)
      console.error("Error saving schedule:", err);
    }
  };

  return (
    <>
      <label className="select-label">Set Duration / Time and Date</label>
      {/* ========================= DURATION ========================= */}
      <div className="duration-container">
        <label className="duration-label">Duration:</label>
        <div className="duration-inner-container">
          <input
            type="number"
            min="0"
            value={durationHours}
            onChange={(e) => {
              let val = e.target.value;
              // keep only numbers and max 2 digits
              if (val.length > 2) val = val.slice(0, 2);
              setDurationHours(Math.max(0, parseInt(val) || 0));
            }}
            style={{ width: "50px" }}
          />
          <span>h</span>
          <input
            type="number"
            min="0"
            max="59"
            value={durationMinutes}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 2) val = val.slice(0, 2);
              setDurationMinutes(
                Math.min(59, Math.max(0, parseInt(val) || 0))
              );
            }}
            style={{ width: "50px" }}
          />
          <span>m</span>
        </div>
      </div>
      {/* ======= TIME-PICKER COMPONENT ======= */}        
      <div className="time-container">
        <label className="time-label">Set Time:</label>
        <TimePickerComponent
          value={startTime}
          onChange={setStartTime}
          label="Start Time"
        />
      </div>
      {/* ==== DATE ==== */}  
      <div className="date-container">
        <label className="date-label">Set Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      {/* ==== TIMER PER QUESTION ==== */} 
      <div className="duration-container">
        <label className="duration-label">Question timer:</label>
        <div className="duration-inner-container">
          <input
            type="number"
            min="0"
            value={questionMinutes}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 2) val = val.slice(0, 2);
              setQuestionMinutes(Math.max(0, parseInt(val) || 0));
            }}
            style={{ width: "50px" }}
          />
          <span>m</span>
          <input
            type="number"
            min="0"
            max="59"
            value={questionSeconds}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 2) val = val.slice(0, 2);
              setQuestionSeconds(Math.min(59, Math.max(0, parseInt(val) || 0)));
            }}
            style={{ width: "50px" }}
          />
          <span>s</span>
        </div>
        <button className="save-duration-button" onClick={handleSave}>Save</button>
      </div>
    </>
  );
}

export default ScheduledTakers;
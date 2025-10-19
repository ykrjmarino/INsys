import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "../components/SelectFields.jsx";
import Button from "../components/Buttons.jsx"

function EssayComponent() {
  return(
    <>
      <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <div style={{ border: '1px solid #ccc', backgroundColor: '#e4a803ff', padding: '10px', borderRadius: '6px', minHeight: '220px', marginBottom: '10px', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', }}>
          {/* Essay text goes here */}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="number" placeholder="Grade" style={{ width: '60px', padding: '5px' }} />
          <button style={{ padding: '8px 15px', border: 'none', backgroundColor: '#4CAF50', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
            Submit
          </button>
        </div>
      </div>
    </>
  )
}

function StudentEssays() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { examId, studentId } = useParams(); 

  const [essay, setEssay] = useState([]);

  useEffect(()=>{
    const fetchEssay = async() => {
      try {
        const res = await axios.get(`/exams/${examId}/essays/${studentId}`);
        setEssay(res.data);
      } catch (error) {
        console.log('fetchEssay failed, in StudentEssays');
        console.error(error.message);
      }
    }
    fetchEssay();
  }, []);

  return(
    <>
      <div style={{ backgroundColor: '#e403b3ff', padding: '5px' }}>
        <p>student name</p>
        <p>student id</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px'}}>
  
        {/* Essay Card */}
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          
          {/* Essay Area */}
          <div style={{ backgroundColor: '#e4a803ff', padding: '10px', borderRadius: '6px', minHeight: '200px', marginBottom: '10px', maxHeight: '220px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', }}>
            {/* Essay text goes here */}
          </div>

          {/* Grade Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="number" placeholder="Grade" style={{ width: '60px', padding: '5px' }} />
            <button style={{ padding: '8px 15px', border: 'none', backgroundColor: '#4CAF50', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
              Submit
            </button>
          </div>
        </div>
        <EssayComponent 
          studentsInfo={essay.filter(e=>e.section_id === 'wait inaantok nako')}
        />
      </div>
    </>
  )
}

export default StudentEssays;
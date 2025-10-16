import axios from "../utils/axiosConfig.js";
import React from "react";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

function ExamAnalytics () {
  const navigate = useNavigate();


  const fetchExamInfo = async() => {
    // /exams/analytics/:examId

  }
  return (
    <>
    {/* START */}
      <div style={{ backgroundColor: '#a4f1ffff', padding: '10px' }}> {/* 3 divs */}
        {/* S1*/}
        <div style={{ backgroundColor: '#00c2b2ff', margin: '6px' }}>
          <button>arrow back-button</button>
          <p>title</p>
          <select></select>
        </div> {/* E1*/}
        

        
        {/* S2*/}
        <div style={{ backgroundColor: '#ecebaeff', margin: '6px' }}>
          <p> Student Performance Analytics </p>
        </div> {/* E2*/}



        {/* S3*/}
        <div style={{ backgroundColor: '#00a136ff', padding: '5px' }}>

          {/* S3.1*/}
          <div style={{ backgroundColor: '#ff0000ff', margin: '6px' }}>
            <div style={{ backgroundColor: '#e8bff5ff', margin: '6px' }}>
              <p> SECTION: {} </p>
            </div>
            <div style={{ backgroundColor: '#ecc5aeff', margin: '6px' }}>
              <p> # of students </p>
            </div>
          </div>{/* E3.1*/}


          {/* S3.2*/}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '40px' }}>
            <div> Name </div>
            <div> Objective Score </div>
            <div> Essay Score </div>
            <div> Score </div>
            <div> Time Taken </div>

            {/* {students.map((s) => (
              <React.Fragment key={i}>
                <div>{s.name}</div>
                <div>{s.score}</div>
                <div>{s.status}</div>
              </React.Fragment>
            ))} */}
          </div>{/* E3.2*/}
          
        </div> {/* E3*/}

      </div>
    {/* END */}
    </>
  )
}

export default ExamAnalytics;
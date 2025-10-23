import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SelectField from "./SelectFields.jsx";
import Button from "./Buttons.jsx"
import { AnalyticsHeaderBar } from "./Header.jsx";

export const TabMonitor = () => {
  let awayStart = null;
  let totalAwayTime = 0;

  useEffect(() => {
    const userInTab = () => {
      if (document.hidden) {
        console.log("you left the exam");
        document.title = "you left, cheater.";
    // dood left the tab
        awayStart = Date.now();
      } else {
        console.log("done cheating?")
        document.title = "now you back, cunt."
      // dood came back
        if (awayStart !== null) { //if yung awayStart is nagstart na magcount
          const timeAway = ((Date.now() - awayStart) / 1000)  //time now - awayStart then divide to 1sec
          totalAwayTime += timeAway;

          console.log(`Umalis ka for layk ${timeAway.toFixed(2)} seconds.`)   //toFixed(#) is yung number of decimal point
                                                                              //whole number lilitaw is 0 sya   
          console.log(`total time you probably cheated: ${totalAwayTime} seconds.`)                                                      
          awayStart = null;
        
        } else {
            console.log('did not count');
        }
      }
    }
    document.addEventListener('visibilitychange', userInTab);
    return () => document.removeEventListener("visibilitychange", userInTab);
  }, []);
  
}

export const ResizeMonitor = ({ examId }) => {
  // tab when they resize it to cheat
  // do alert or blur
  // idk how to test sa mobile yet, magminecraft muna ako..
  // also, think another way sa mga sizes instead of fixed size, and for double screen mfs

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const minWidth = isMobile ? 300 : 1700;
  const minHeight = isMobile ? 400 : 400;
  const resizeSecondsRef = React.useRef(0); // store cumulative time accurately

  // force reload when switching to mobile (for DevTools)
  if (isMobile && !window.localStorage.getItem("mobileModeChecked")) {
    window.localStorage.setItem("mobileModeChecked", "true");
    location.reload(); // Refresh to update user agent
  }

  useEffect(() => {
    let resizeStart = null;
    let timer = null;
    let is_warning = null;

    const handleResize = () => {
      const tooSmall = window.innerHeight < minHeight || window.innerWidth < minWidth;

      // if smoller yung tab sa minimum
      if (tooSmall && !resizeStart) {
        resizeStart = Date.now();
        console.log("⚠️ Window too small! Possible cheating started");

        document.body.style.filter = "blur(8px)";
        document.body.style.pointerEvents = "none";

        timer = setInterval(() => {
          resizeSecondsRef.current += 1; // increment cumulative seconds every 1s
        }, 1000);
      }

      // when resize violation stops (user returns to normal size)
      else if (!tooSmall && resizeStart) {
        const elapsed = (Date.now() - resizeStart) / 1000;
        clearInterval(timer);
        resizeSecondsRef.current += elapsed; // add remaining seconds

        document.body.style.filter = "none";
        document.body.style.pointerEvents = "auto";

        console.log(`✅ Resize violation stopped. Duration: ${elapsed.toFixed(2)}s`);
        console.log(`📊 Total resize time so far: ${resizeSecondsRef.current.toFixed(2)}s`);
        console.log("📤 Sending to backend...");

        is_warning = elapsed >= 5;

        // patch to backend instead of updating every second
        // we send only after resize violation stops
        axios.post(`/exam/${examId}/violations/student`, {
          event_type: "tab_resize",
          is_warning,
          details: `Resized window for ${elapsed.toFixed(2)}s`, //just rounds the number to 2 decimal places
        })
        .then(() => console.log("✅ Resize violation saved successfully"))
        .catch((err) => console.log("❌ Failed to save resize violation:", err.message));

        resizeStart = null;
        timer = null;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(timer);
    };
  }, [minHeight, minWidth, examId]);

  return null;
};


function FaceMonitor() {
  useEffect(() => {
    const run = async()=>{
      //we need to load our models

      //loading the models is going to use await
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false,
      })
      const videoFeedEl = document.getElementById('video-feed')
      videoFeedEl.srcObject = stream;

      // Check if it is undefined
      console.log("bitch" + faceapi.nets.ssdMobilenetv1); 

      await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
          faceapi.nets.ageGenderNet.loadFromUri('./models'),
          faceapi.nets.faceExpressionNet.loadFromUri('./models'),
      ]).then(() => {
          console.log('All models loaded successfully');
      }).catch(err => {
          console.error('Error loading models:', err);
      })

  // make the canvas the same size and same location kung asaan video feed natin
      const canvas = document.getElementById('canvas');
      canvas.style.left = videoFeedEl.offsetLeft;
      canvas.style.top = videoFeedEl.offsetTop;
      canvas.height = videoFeedEl.height;
      canvas.width = videoFeedEl.width; 

  // facial detection with points
      setInterval(async() => {
      // get video feed and hand it to detectAllFaces method
          let faceAIData = await faceapi.detectAllFaces(videoFeedEl)
              .withFaceLandmarks()
              .withFaceDescriptors()
              .withFaceExpressions()
              .withAgeAndGender()
          // faceAIData is an array, one element for each face

      //clear the canvas
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      //resize results to fit video-feed
          faceAIData = faceapi.resizeResults(faceAIData, videoFeedEl);
          faceapi.draw.drawDetections(canvas, faceAIData);
          faceapi.draw.drawFaceLandmarks(canvas, faceAIData);
          faceapi.draw.drawFaceExpressions(canvas, faceAIData);

      //draw detections pag nadetect yung face
          if (faceAIData.length > 2) {
              console.log('More than two faces detected:', faceAIData.length);
          } else if (faceAIData.length === 2) {
              console.log('Two faces detected');
          } else if (faceAIData.length === 1) {
              console.log('Face detected');
          } else {
              console.log('No face detected');
          }
      }, 1000) //change speed cuh 1000 is 1sec

  // console.log(Object.keys(faceapi.nets.ssdMobilenetv1)); // This shows the keys of the object
    }
    run()
  }, []);
}

export default FaceMonitor;
import axios from "../utils/axiosConfig.js";
import React from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// import * as tf from "@tensorflow/tfjs";
// import * as faceapi from "face-api.js";

// import { useRef } from "react";


export const TabMonitor = ({ examId }) => {
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
          
          
          // send to backend
          const is_warning = timeAway >= 5; // warning if they left > 5s
          axios.post(`/exam/${examId}/violations/student`, {
            event_type: "tab_switch",
            is_warning,
            details: `Left the tab for ${timeAway.toFixed(2)}s`
          })
          .then(() => console.log("✅ Tab switch violation saved successfully"))
          .catch((err) => console.log("❌ Failed to save tab switch violation:", err.message));

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

    handleResize()

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(timer);
    };
  }, [minHeight, minWidth, examId]);

  return null;
};


// export const FaceMonitor = ({ examId }) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     let intervalId;

//     const run = async () => {

//       await tf.setBackend("webgl");
//       await tf.ready();

//       // load models from public/models/
//       await Promise.all([
//         faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//         faceapi.nets.ageGenderNet.loadFromUri("/models"),
//         faceapi.nets.faceExpressionNet.loadFromUri("/models"),
//       ]).catch(err => console.error("Error loading models:", err));

//       // get video stream
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       if (videoRef.current) videoRef.current.srcObject = stream;

//       // start detection after video is playing
//       videoRef.current.addEventListener("play", () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const displaySize = {
//           width: videoRef.current.videoWidth,
//           height: videoRef.current.videoHeight,
//         };
//         faceapi.matchDimensions(canvas, displaySize);

//         intervalId = setInterval(async () => {
//           const detections = await faceapi
//             .detectAllFaces(videoRef.current)
//             .withFaceLandmarks()
//             .withFaceDescriptors()
//             .withFaceExpressions()
//             .withAgeAndGender();

//           // resize detections to video
//           const resizedDetections = faceapi.resizeResults(detections, displaySize);

//           // clear canvas
//           const ctx = canvas.getContext("2d");
//           ctx.clearRect(0, 0, canvas.width, canvas.height);

//           // draw
//           faceapi.draw.drawDetections(canvas, resizedDetections);
//           faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
//           faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

//           // handle violations
//           if (detections.length === 0 || detections.length > 1) {
//             console.log("Face violation detected", detections.length);
//             axios.post(`/exam/${examId}/violations/student`, {
//               event_type: "face_violation",
//               details: `Detected ${detections.length} faces`,
//               is_warning: true,
//             }).catch(err => console.error(err.message));
//           }
//         }, 1000);
//       });
//     };

//     run();

//     return () => clearInterval(intervalId);
//   }, [examId]);

//   return (
//     <div style={{ position: "relative", display: "inline-block" }}>
//       <video ref={videoRef} autoPlay muted width={350} height={280} />
//       <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }} />
//     </div>
//   );
// };

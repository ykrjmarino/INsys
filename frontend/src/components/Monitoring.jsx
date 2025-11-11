import axios from "../utils/axiosConfig.js";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useState } from 'react';
import { toast } from 'react-toastify';

// import * as tf from "@tensorflow/tfjs";
// import * as faceapi from "face-api.js";

import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

export const TabMonitor = ({ examId }) => {
  let awayStart = null;
  let totalAwayTime = 0;

  useEffect(() => {
    const userInTab = () => {
      if (document.hidden) {
        console.log("user left the tab");
        document.title = "user left; possible cheating.";
    // dood left the tab
        awayStart = Date.now();
      } else {
        console.log("user back")
        document.title = "INsys"
      // dood came back
        if (awayStart !== null) { //if yung awayStart is nagstart na magcount
          const timeAway = ((Date.now() - awayStart) / 1000)  //time now - awayStart then divide to 1sec
          totalAwayTime += timeAway;

          console.log(`Gone for ${timeAway.toFixed(2)} seconds.`)   //toFixed(#) is yung number of decimal point
                                                                              //whole number lilitaw is 0 sya   
          console.log(`Total time user left: ${totalAwayTime} seconds.`)        
          
          
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
  return null;
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
    let warningOverlay = null;

    const showWarning = () => {
      if (warningOverlay) return; // avoid duplicates

      warningOverlay = document.createElement("div");
      warningOverlay.style.position = "fixed";
      warningOverlay.style.top = 0;
      warningOverlay.style.left = 0;
      warningOverlay.style.width = "100vw";
      warningOverlay.style.height = "100vh";
      warningOverlay.style.backgroundColor = "rgba(0,0,0,0.7)";
      warningOverlay.style.backdropFilter = "blur(8px)";
      warningOverlay.style.display = "flex";
      warningOverlay.style.alignItems = "center";
      warningOverlay.style.justifyContent = "center";
      warningOverlay.style.zIndex = 9999;
      warningOverlay.style.color = "white";
      warningOverlay.style.fontSize = "2rem";
      warningOverlay.style.fontWeight = "bold";
      warningOverlay.innerText = "⚠️ Window too small — Please return to the exam!";
      document.body.appendChild(warningOverlay);
    };

    const hideWarning = () => {
      if (warningOverlay) {
        warningOverlay.remove();
        warningOverlay = null;
      }
    };

    const handleResize = () => {
      const tooSmall = window.innerHeight < minHeight || window.innerWidth < minWidth;

      // if smoller yung tab sa minimum
      if (tooSmall && !resizeStart) {
        resizeStart = Date.now();
        console.log("⚠️ Window too small! Possible cheating started");

        showWarning();

        timer = setInterval(() => {
          resizeSecondsRef.current += 1; // increment cumulative seconds every 1s
        }, 1000);
      }

      // when resize violation stops (user returns to normal size)
      else if (!tooSmall && resizeStart) {
        const elapsed = (Date.now() - resizeStart) / 1000;
        clearInterval(timer);
        resizeSecondsRef.current += elapsed; // add remaining seconds

        hideWarning();

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


export const MouseMonitor = ({ examId }) => {
  useEffect(() => {
    console.log("🟢 MouseMonitor active");
    let mouseLeftAt = null;
    let warningOverlay = null;

    const showWarning = () => {
      warningOverlay = document.createElement("div");
      warningOverlay.style.position = "fixed";
      warningOverlay.style.top = 0;
      warningOverlay.style.left = 0;
      warningOverlay.style.width = "100vw";
      warningOverlay.style.height = "100vh";
      warningOverlay.style.backgroundColor = "rgba(0,0,0,0.7)";
      warningOverlay.style.backdropFilter = "blur(8px)";
      warningOverlay.style.display = "flex";
      warningOverlay.style.alignItems = "center";
      warningOverlay.style.justifyContent = "center";
      warningOverlay.style.zIndex = 9999;
      warningOverlay.style.color = "white";
      warningOverlay.style.fontSize = "2rem";
      warningOverlay.style.fontWeight = "bold";
      warningOverlay.innerText = "Focus Lost — Please return to the exam!";
      document.body.appendChild(warningOverlay);
    };

    const hideWarning = () => {
      if (warningOverlay) {
        warningOverlay.remove();
        warningOverlay = null;
      }
    };

    const handleMouseLeave = () => {
      console.log("Mouse left the exam window");
      mouseLeftAt = Date.now();
      showWarning();
    };

    const handleMouseEnter = () => {
      hideWarning();
      if (mouseLeftAt) {
        const timeAway = ((Date.now() - mouseLeftAt) / 1000).toFixed(2);
        console.log(`Mouse returned after ${timeAway}s`);

        const is_warning = timeAway >= 3;
        axios.post(`/exam/${examId}/violations/student`, {
          event_type: "mouse_leave",
          is_warning,
          details: `Mouse left window for ${timeAway}s`
        })
        .then(() => console.log("✅ Mouse violation saved"))
        .catch((err) => console.log("❌ Failed to save mouse violation:", err.message));

        mouseLeftAt = null;
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      hideWarning();
    };
  }, [examId]);
};


export const CameraMonitor = () => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [offset, setOffset] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        const checkCameraActive = setInterval(() => {
          const track = stream.getVideoTracks()[0];
          if (!track || track.readyState === "ended") {
            console.log("🚨 Camera turned off or permission revoked");
            toast.error("🚨 Camera turned off or permission revoked!");
          }
        }, 5000); // 5000ms = 5s

        // cleanup
        return () => clearInterval(checkCameraActive);
      } catch (err) {
        toast.error("❌ Camera access denied");
        console.error("Camera access denied:", err);
      }
    };
    startCamera();
  }, []);

  const handleMouseDown = (e) => {
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (offset) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => setOffset(null);

  // Touch support (for mobile)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (offset) {
      setPosition({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      });
    }
  };

  const handleTouchEnd = () => setOffset(null);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  });

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        cursor: "move",
        zIndex: 9999,
        borderRadius: "20px",
        width: "360px",
        height: "280px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)"}}
      />
    </div>
  );
};



export const FaceMonitor = ({ examId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pos, setPos] = useState({ top: 100, left: 100 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const intervalId = useRef(null);

  const lastViolationTime = useRef(null);
  const violationOngoing = useRef(false);
  const violationType = useRef(null);
  const maxDetectedFaces = useRef(0);

  useEffect(() => {
    const run = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      // load models from public/models/
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]).catch((err) => console.error("Error loading models:", err));

      // get video stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;

      videoRef.current.addEventListener("play", () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        intervalId.current = setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(videoRef.current)
            .withFaceLandmarks()

            /*
              we dont need these, too heavy for devices:

             .withFaceDescriptors() //used for face recognition/matching
             .withFaceExpressions() //detects facial expressions
             .withAgeAndGender() //detecting age lol

            */

          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          // draw as before
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

          const violation = detections.length === 0 || detections.length > 1;
          const now = Date.now();

          if (violation && !violationOngoing.current) {
            // violation started
            violationOngoing.current = true;
            lastViolationTime.current = now;
            violationType.current = detections.length === 0 ? "no_face" : "multiple_faces";
            maxDetectedFaces.current = detections.length; // initialize

            // show overlay
            if (!document.getElementById("face-warning-overlay")) {
              const warningOverlay = document.createElement("div");
              warningOverlay.id = "face-warning-overlay";
              warningOverlay.style.position = "fixed";
              warningOverlay.style.top = 0;
              warningOverlay.style.left = 0;
              warningOverlay.style.width = "100vw";
              warningOverlay.style.height = "100vh";
              warningOverlay.style.backgroundColor = "rgba(0,0,0,0.7)";
              warningOverlay.style.backdropFilter = "blur(8px)";
              warningOverlay.style.display = "flex";
              warningOverlay.style.alignItems = "center";
              warningOverlay.style.justifyContent = "center";
              warningOverlay.style.zIndex = 9999;
              warningOverlay.style.color = "white";
              warningOverlay.style.fontSize = "2rem";
              warningOverlay.style.fontWeight = "bold";
              warningOverlay.innerText =
                violationType.current === "no_face"
                  ? "No face detected — Please look at the camera!"
                  : `Detected ${maxDetectedFaces.current} faces — Only you should be in front of the camera`;
              document.body.appendChild(warningOverlay);
            }
          } else if (violation && violationOngoing.current) {
            // update max faces during ongoing violation
            if (detections.length > maxDetectedFaces.current) {
              maxDetectedFaces.current = detections.length;
            }
          } else if (!violation && violationOngoing.current) {
            // violation ended → check duration
            const overlay = document.getElementById("face-warning-overlay");
            if (overlay) overlay.remove();

            const elapsed = (now - lastViolationTime.current) / 1000;

            if (elapsed >= 3) {
              let details = "";
              if (violationType.current === "no_face") {
                details = `No face detected for ${elapsed.toFixed(2)}s`;
              } else if (violationType.current === "multiple_faces") {
                details = `Detected ${maxDetectedFaces.current} faces for ${elapsed.toFixed(2)}s`;
              }

              axios.post(`/exam/${examId}/violations/student`, {
                event_type: "face_violation",
                is_warning: elapsed >= 5,
                details,
              }).catch((err) => console.error(err.message));
            }

            violationOngoing.current = false;
            violationType.current = null;
            maxDetectedFaces.current = 0; // reset
          }
        }, 1000);
      });
    };

    run();

    return () => clearInterval(intervalId.current);
  }, [examId]);

  return (
    <div className="drag-video-container"
      style={{
        position: "fixed",
        top: window.innerWidth < 768 ? "8%" : "10%",   // closer to top on mobile
        left: window.innerWidth < 768 ? "80%" : "92%", // adjust horizontal on mobile
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
      onMouseDown={(e) => {
        dragging.current = true;
        offset.current = { x: e.clientX - pos.left, y: e.clientY - pos.top };
      }}
      onMouseUp={() => (dragging.current = false)}
      onMouseMove={(e) => {
        if (!dragging.current) return;
        setPos({ top: e.clientY - offset.current.y, left: e.clientX - offset.current.x });
      }}
    >
      <video ref={videoRef} autoPlay muted className="drag-video" />
      <canvas
        ref={canvasRef}
        style={{
          display: "none", pointerEvents: "none",
          // position: "absolute",
          // top: 0,
          // left: 0,
          // zIndex: 10,
          // pointerEvents: "none",
          // background: "transparent",
        }}
      />
    </div>
  );
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
        
//         canvas.width = displaySize.width;   // ← add this
//         canvas.height = displaySize.height;

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
//       <video ref={videoRef} autoPlay muted width={350} height={280} style={{ position: "relative", zIndex: 1 }}/>
//       <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 10, pointerEvents: "none", background: "transparent"}} />
//     </div>
//   );
// };

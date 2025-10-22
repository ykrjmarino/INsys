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

export const ResizeMonitor = () => {
  // tab when they resize it to cheat
  // do alert or blur
  // idk how to test sa mobile yet, magminecraft muna ako.. 
  // also, think another way sa sizes instead of fized size, and for double screen mfs

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const minWidth = isMobile ? 300 : 1700;
  const minHeight = isMobile ? 400 : 400;

  // force reload when switching to mobile (for DevTools)
  if (isMobile && !window.localStorage.getItem("mobileModeChecked")) {
    window.localStorage.setItem("mobileModeChecked", "true");
    location.reload(); // Refresh to update user agent
  }

  const [resizeSeconds, setResizeSeconds] = useState(0); // total accumulated seconds
  const [isResizing, setIsResizing] = useState(false); // currently below threshold
  

  useEffect(() => {
    let startTs = null;      // timestamp when current "too small" period started
    let tickInterval = null; // interval that increments resizeSeconds every 1s

    const applyBlur = () => {
      document.body.style.filter = "blur(8px)";
      document.body.style.pointerEvents = "none";
    };
    const removeBlur = () => {
      document.body.style.filter = "none";
      document.body.style.pointerEvents = "auto";
    };

    const handleResize = () => {
      const tooSmall = window.innerHeight < minHeight || window.innerWidth < minWidth;

      if (tooSmall) {
        // started or continuing a too-small period
        if (!startTs) {
          startTs = Date.now();
          setIsResizing(true);
          applyBlur();
          // start ticking once per second to accumulate seconds
          tickInterval = setInterval(() => {
            setResizeSeconds(prev => prev + 1);
          }, 1000);
        }
        // if already started, nothing else to do here (tickInterval handles accumulation)
      } else {
        // restored to acceptable size
        if (startTs) {
          // clear the current period
          startTs = null;
          setIsResizing(false);
          removeBlur();
          if (tickInterval) {
            clearInterval(tickInterval);
            tickInterval = null;
          }
        }
      }
    };

    // run once on mount so blur applies immediately if window already too small
    handleResize();

    window.addEventListener("resize", handleResize);
    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (tickInterval) clearInterval(tickInterval);
      // ensure blur removed when unmounting (so other pages aren't stuck blurred)
      removeBlur();
    };
  }, [minHeight, minWidth]);

  useEffect(() => {
    console.log("Resize seconds:", resizeSeconds);
  }, [resizeSeconds]); //we can store this one cuz it continues counting

  // you can use resizeSeconds and isResizing in your UI or report them via axios when needed
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
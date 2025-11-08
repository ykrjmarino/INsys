console.log(faceapi);

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

// tab monitoring if away
    
    let awayStart = null;
    let totalAwayTime = 0;
    //need nasa labas tong dalawa para macount yung awayStart
    //or you can use anonymous functions layk document.addEventListener("visibilitychange", ()=>) para mapagsama sa loob ng function

    function userInTab() {
        
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
    document.addEventListener('visibilitychange', userInTab)

// tab when they resize it to cheat
// do alert or blur

    // idk how to test sa mobile yet, magminecraft muna ako.. 
    // also, think another way sa mga sizes instead of fized size, and for double screen mfs
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const minWidth = isMobile ? 300 : 1700;
    const minHeight = isMobile ? 400 : 400;

    // force reload when switching to mobile (for DevTools)
    if (isMobile && !window.localStorage.getItem("mobileModeChecked")) {
    window.localStorage.setItem("mobileModeChecked", "true");
    location.reload(); // Refresh to update user agent
    }


    function handleResize() {
        if (window.innerHeight < minHeight || window.innerWidth < minWidth) { //if smoller yung tab sa minimum
            console.log("Window too small! Possible cheating")
        // alert("Please do not resize or minimize your window")
            document.body.style.filter = "blur(8px)";
            document.body.style.pointerEvents = "none";
        } else {
            document.body.style.filter = "none";
            document.body.style.pointerEvents = "auto";
        }
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // this will reload the website even though you resized it at first... ewan

// mobile orientation for mobile bros out there
    //force portrait mode to reduce the chance of: Split-screening--Easy app-switching--Landscape-friendly cheating tools
    //if you know how to do all these then you are smart enough, why you cheating u dumass

    //lets do inline anonymous functions cuz tinamad nako magtype and para magamit ko natutunan ko for once -_-
    window.addEventListener("orientationchange", () => {
        const angleOfMobile = window.orientation || window.screen.orientation.angle;
        if (angleOfMobile === 90 || angleOfMobile === -90) {
            alert("plis stay in portrait mode");
        }
    });

// trying the openAI API here... need money to use

    fetch('/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Juan Dela Cruz',
          score: 42,
          totalItems: 50,
          weakTopics: 'Algebra, Trigonometry'
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('AI Feedback:', data.feedback);
      });
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { calculateAngles, calculateSimilarity } from './utils/angleCalculations.js';
import { drawPoseWithFeedback, drawSuccessFeedback } from './utils/drawingUtils.js';

const FeedbackFooter = ({ feedbackSentences }) => {
  return (
    <div className="feedback-footer">
      <h3>Feedback</h3>
      <ul>
        {feedbackSentences.map((sentence, index) => (
          <li key={index}>{sentence}</li>
        ))}
      </ul>
    </div>
  );
};

const WebcamCapture = ({ referenceData }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 640, height: 480 });
  const [poseSuccess, setPoseSuccess] = useState(false);
  const [successTime, setSuccessTime] = useState(0);
  const [feedbackSentences, setFeedbackSentences] = useState([]);
  const successTimerRef = useRef(null);

  const lastFrameTime = useRef(0);
  const frameCount = useRef(0);
  const fps = useRef(0);

  const startDetectionLoop = useCallback(() => {
    const detectPose = async () => {
      if (!videoRef.current || !canvasRef.current || !detector || !referenceData) {
        requestRef.current = requestAnimationFrame(detectPose);
        return;
      }
      
      const now = performance.now();
      frameCount.current++;
      
      if (now - lastFrameTime.current >= 1000) {
        fps.current = frameCount.current;
        window.lastFrameRate = fps.current;
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
      
      try {
        const poses = await detector.estimatePoses(videoRef.current);
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (poses && poses.length > 0) {
          const pose = poses[0];
          
          const normalizedKeypoints = pose.keypoints.map(kp => ({
            ...kp,
            x: kp.x / canvasRef.current.width,
            y: kp.y / canvasRef.current.height
          }));
          
          const currentAngles = calculateAngles(normalizedKeypoints);
          const similarityScore = calculateSimilarity(referenceData.angles, currentAngles);
          setSimilarity(similarityScore);
          console.log("Similarity Score=", similarityScore);
          
          const incorrectJoints = drawPoseWithFeedback(
            ctx, 
            normalizedKeypoints, 
            referenceData.angles, 
            currentAngles
          );

          console.log("Pose success Status:", poseSuccess);

          const sentences = incorrectJoints.map(joint => 
            `Adjust ${joint.name.replace("_", " ")}: ${joint.current > joint.reference ? "straighten" : "bend"} more`
          );
          setFeedbackSentences(sentences);

          if (poseSuccess) {
            drawSuccessFeedback(ctx, successTime);
          }
        } else {
          ctx.font = "24px Arial";
          ctx.fillStyle = "#FF0000";
          ctx.fillText("No pose detected - please stand in frame", 50, canvasRef.current.height / 2);
        }
      } catch (err) {
        console.error("Error in pose detection loop:", err);
      }
      
      requestRef.current = requestAnimationFrame(detectPose);
    };
    
    detectPose();
  }, [detector, referenceData, poseSuccess, successTime]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerWidth * (3/4);
        
        setCanvasDimensions({
          width: containerWidth,
          height: containerHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  useEffect(() => {
    if (!referenceData) return;
    
    const loadModel = async () => {
      try {
        console.log("Loading TensorFlow.js and pose detection model...");
        await tf.ready();
        console.log("TensorFlow.js is ready");
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        
        const loadedDetector = await poseDetection.createDetector(model, detectorConfig);
        console.log("Pose detection model loaded");
        
        setDetector(loadedDetector);
        setModelLoading(false);
      } catch (err) {
        console.error("Failed to load pose detection model:", err);
        setErrorMessage(`Failed to load pose detection model: ${err.message}`);
        setModelLoading(false);
      }
    };
    
    loadModel();
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [referenceData]);
  
  useEffect(() => {
    const startWebcam = async () => {
      if (isActive && detector && referenceData) {
        try {
          const constraints = {
            video: {
              width: { ideal: canvasDimensions.width },
              height: { ideal: canvasDimensions.height },
              facingMode: "user"
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          const videoElement = videoRef.current;
          
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
            
            videoElement.onloadedmetadata = () => {
              startDetectionLoop();
            };
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setErrorMessage(`Failed to access webcam: ${err.message}. Please check your camera permissions.`);
          setIsActive(false);
        }
      } else {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      }
    };
    
    startWebcam();
    
    return () => {
      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
}, [detector, isActive, referenceData, canvasDimensions, startDetectionLoop]);


  useEffect(() => {
    if (!isActive) {
      console.log("Camera is not active. Resetting pose success and success time.");
      setPoseSuccess(false);
      setSuccessTime(0);
      if (successTimerRef.current) {
        clearInterval(successTimerRef.current);
        successTimerRef.current = null;
      }
      return;
    }
    
    const HIGH_SIMILARITY_THRESHOLD = 92;
    
    if (successTimerRef.current) {
      console.log("Successtimer=", successTimerRef.current);
      
      clearInterval(successTimerRef.current);
    }
    
    if (similarity >= HIGH_SIMILARITY_THRESHOLD && !poseSuccess) {
      console.log("Starting success timer for high similarity threshold.");
      let elapsedTime = 0;
      
      successTimerRef.current = setInterval(() => {
        if (similarity >= HIGH_SIMILARITY_THRESHOLD) {
          elapsedTime += 100;
          setSuccessTime(elapsedTime / 1000);
          console.log(`Elapsed time: ${elapsedTime}ms, Success time: ${elapsedTime / 1000}s`);
          
          if (elapsedTime >= 3000 && !poseSuccess) {
            console.log("Pose success achieved!");
            setPoseSuccess(true);
          }
        } else {
          console.log("Similarity below threshold. Resetting elapsed time and success time.");
          elapsedTime = 0;
          setSuccessTime(0);
        }
      }, 100);
    } else if (similarity < HIGH_SIMILARITY_THRESHOLD) {
      console.log("Similarity below threshold. Resetting success time.");
      setSuccessTime(0);
    }
    
    return () => {
      if (successTimerRef.current) {
        console.log("Cleaning up success timer.");
        clearInterval(successTimerRef.current);
      }
    };
  }, [similarity, isActive, poseSuccess]);
  
  const toggleCamera = () => {
    setIsActive(!isActive);
  };
  
  return (
    <div className="webcam-capture">
      <h2>Live Pose Comparison</h2>
      
      {!referenceData ? (
        <p className="instruction-text">Please upload a reference pose first</p>
      ) : (
        <div className="fullscreen-comparison" ref={containerRef}>
          <div className="controls-overlay">
            <button 
              className={`camera-toggle ${isActive ? 'active' : ''}`}
              onClick={toggleCamera}
              disabled={modelLoading}
            >
              {isActive ? 'Stop Camera' : 'Start Camera'}
            </button>
            
            {modelLoading && (
              <p className="loading-indicator">Loading pose detection model...</p>
            )}
            
            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
              </div>
            )}
            
            {isActive && (
              <div className="similarity-display">
                <p>Similarity: <span className={similarity > 70 ? 'high' : similarity > 50 ? 'medium' : 'low'}>
                  {similarity.toFixed(1)}%
                </span></p>
              </div>
            )}
          </div>
          
          <div className="video-container">
            <video
              ref={videoRef}
              style={{ display: 'none' }}
            />
            <canvas 
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height} 
              className="fullscreen-canvas"
            />
          </div>

          {isActive && (
            <FeedbackFooter feedbackSentences={feedbackSentences} />
          )}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { calculateAngles } from '../utils/angleCalculations';
import '../styles/ReferenceImageUpload.css';

const ReferenceImageUpload = ({ onReferenceSet }) => {
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detector, setDetector] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Load TensorFlow.js pose detection model
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading TensorFlow.js and pose detection model...");
        
        // Ensure TensorFlow.js is ready
        await tf.ready();
        console.log("TensorFlow.js is ready");
        
        // Create pose detector
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
        setError(`Failed to load pose detection model: ${err.message}`);
        setModelLoading(false);
      }
    };
    
    loadModel();
    
    // Clean up function
    return () => {
      // TensorFlow.js cleanup if needed
    };
  }, []);

  const processReferenceImage = async (imageElement) => {
    if (!detector) {
      setError("Pose detection model is not loaded yet");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Processing reference image...");
      
      // Create a temporary canvas to convert image to tensor
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageElement.width;
      tempCanvas.height = imageElement.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(imageElement, 0, 0);
      
      // Run pose detection
      const poses = await detector.estimatePoses(imageElement);
      
      console.log("Pose detection result:", poses);
      
      if (!poses || poses.length === 0 || !poses[0].keypoints || poses[0].keypoints.length === 0) {
        setError("No pose detected in the image. Please try an image with a clear person.");
        setLoading(false);
        return;
      }
      
      // Get the first detected pose
      const pose = poses[0];
      
      // Draw results on canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      
      // Draw original image
      ctx.drawImage(imageElement, 0, 0);
      
      // Draw keypoints and connections
      for (const keypoint of pose.keypoints) {
        if (keypoint.score > 0.3) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'lime';
          ctx.fill();
        }
      }
      
      // Draw connections between keypoints
      const connections = [
        [pose.keypoints[5], pose.keypoints[6]], // shoulders
        [pose.keypoints[5], pose.keypoints[7]], // left shoulder to left elbow
        [pose.keypoints[7], pose.keypoints[9]], // left elbow to left wrist
        [pose.keypoints[6], pose.keypoints[8]], // right shoulder to right elbow
        [pose.keypoints[8], pose.keypoints[10]], // right elbow to right wrist
        [pose.keypoints[5], pose.keypoints[11]], // left shoulder to left hip
        [pose.keypoints[6], pose.keypoints[12]], // right shoulder to right hip
        [pose.keypoints[11], pose.keypoints[12]], // hips
        [pose.keypoints[11], pose.keypoints[13]], // left hip to left knee
        [pose.keypoints[13], pose.keypoints[15]], // left knee to left ankle
        [pose.keypoints[12], pose.keypoints[14]], // right hip to right knee
        [pose.keypoints[14], pose.keypoints[16]]  // right knee to right ankle
      ];
      
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 2;
      
      for (const [start, end] of connections) {
        if (start && end && start.score > 0.3 && end.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      }
      
      // Calculate angles for the reference pose
      const keypoints = pose.keypoints.map(kp => ({
        ...kp,
        // Normalize coordinates to 0-1 range for consistency
        x: kp.x / canvas.width,
        y: kp.y / canvas.height
      }));
      
      const angles = calculateAngles(keypoints);
      
      console.log("Reference angles calculated:", angles);
      
      if (!angles || Object.keys(angles).length === 0) {
        setError("Failed to calculate pose angles. Please try with a different image.");
        setLoading(false);
        return;
      }
      
      // Pass the reference data back to parent component
      onReferenceSet({
        angles,
        keypoints,
        imageUrl: canvas.toDataURL()
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error processing reference image:", err);
      setError(`Error processing image: ${err.message}. Please try a different image.`);
      setLoading(false);
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Reset states
    setError(null);
    setLoading(true);
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image. Please select an image file.');
      setLoading(false);
      return;
    }
    
    // Log file info
    console.log("Selected file:", file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
    
    // Create URL for preview
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Create and load image
    const img = new Image();
    img.onload = () => {
      console.log(`Image ${file.name} loaded:`, img.width, "x", img.height);
      imageRef.current = img;
      
      // Process the loaded image
      processReferenceImage(img);
    };
    
    img.onerror = (err) => {
      console.error(`Error loading image ${file.name}:`, err);
      setError(`Error loading image: ${err.message}.`);
      setLoading(false);
    };
    
    img.src = fileUrl;
  };
  
  // Handle demo image
  const handleDemoImage = () => {
    setError(null);
    setLoading(true);
    
    // Use a known good image for testing
    const demoImageUrl = "https://i.imgur.com/yt4FdT9.jpg";  // Person standing straight
    
    const img = new Image();
    img.crossOrigin = "anonymous";  // Important for canvas to work with external images
    
    img.onload = () => {
      console.log("Demo image loaded:", img.width, "x", img.height);
      setPreviewUrl(demoImageUrl);
      imageRef.current = img;
      
      // Delay processing slightly to ensure canvas is in DOM
      setTimeout(() => {
        processReferenceImage(img);
      }, 100);
    };
    
    img.onerror = (err) => {
      console.error("Error loading demo image:", err);
      setError('Failed to load demo image. Please check your internet connection.');
      setLoading(false);
    };
    
    img.src = demoImageUrl;
  };
  
  return (
    <div className="reference-image-upload">
      <h2>Select Reference Pose</h2>
      
      {modelLoading ? (
        <div className="loading-indicator">
          <p>Loading pose detection model... This may take a moment.</p>
        </div>
      ) : (
        <div className="upload-container">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input"
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="upload-button"
          >
            Choose File
          </button>
          
          <button 
            onClick={handleDemoImage}
            className="upload-button demo-button"
            style={{ marginLeft: '10px', backgroundColor: '#34a853' }}
          >
            Try Demo Image
          </button>
        </div>
      )}
      
      {loading && (
        <div className="loading-indicator">
          <p>Processing image... This may take a few moments.</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Try these tips:</p>
          <ul>
            <li>Use an image with a clear, full-body human pose</li>
            <li>Ensure the person is facing the camera</li>
            <li>Use a well-lit image with good contrast</li>
            <li>Try a different image format (JPG or PNG)</li>
            <li>Use a smaller image size if the current one is very large</li>
          </ul>
        </div>
      )}
      
      {/* Make sure canvas always exists in DOM but hidden when not used */}
      <div className={`preview-container ${(previewUrl && !loading && !error) ? '' : 'hidden'}`}>
        <h3>Reference Pose:</h3>
        <canvas ref={canvasRef} className="reference-canvas" />
      </div>
    </div>
  );
};

export default ReferenceImageUpload;
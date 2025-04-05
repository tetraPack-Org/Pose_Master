import React, { useState, useRef, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { calculateAngles } from "./angleCalculations";

const DirectPoseAnalysis = ({ imageUrl }) => {
  // State for image processing
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imagePoseData, setImagePoseData] = useState(null);

  // State for webcam
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [webcamPoseData, setWebcamPoseData] = useState(null);
  const [similarity, setSimilarity] = useState(0);

  // Shared state
  const [detector, setDetector] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);

  // Refs
  const imageCanvasRef = useRef(null);
  const webcamCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const imageRef = useRef(null);

  // Load TensorFlow.js pose detection model
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading TensorFlow.js and pose detection model...");
        await tf.ready();
        console.log("TensorFlow.js is ready");

        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };

        const loadedDetector = await poseDetection.createDetector(
          model,
          detectorConfig
        );
        console.log("Pose detection model loaded");
        setDetector(loadedDetector);
        setModelLoading(false);
      } catch (err) {
        console.error("Failed to load pose detection model:", err);
        setImageError(`Failed to load pose detection model: ${err.message}`);
        setWebcamError(`Failed to load pose detection model: ${err.message}`);
        setModelLoading(false);
      }
    };

    loadModel();
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Process image from URL
  useEffect(() => {
    if (!imageUrl || !detector || modelLoading) return;

    const processImageFromUrl = async () => {
      setImageLoading(true);
      setImageError(null);

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async () => {
          try {
            imageRef.current = img;

            // Initialize canvas
            const canvas = imageCanvasRef.current;
            if (!canvas) {
              throw new Error("Canvas reference is null");
            }

            // Set initial canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("Failed to get canvas context");
            }

            // Draw the original image first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Run pose detection
            const poses = await detector.estimatePoses(img);
            if (!poses || poses.length === 0 || !poses[0].keypoints) {
              throw new Error("No pose detected in the image");
            }

            const pose = poses[0];

            // Draw keypoints
            for (const keypoint of pose.keypoints) {
              if (keypoint.score > 0.3) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "lime";
                ctx.fill();

                // Label keypoints
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.font = "12px Arial";
                ctx.strokeText(keypoint.name, keypoint.x + 7, keypoint.y - 7);
                ctx.fillText(keypoint.name, keypoint.x + 7, keypoint.y - 7);
              }
            }

            // Draw skeleton connections
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
              [pose.keypoints[14], pose.keypoints[16]], // right knee to right ankle
            ];

            // Draw connections
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 2;
            for (const [start, end] of connections) {
              if (start && end && start.score > 0.3 && end.score > 0.3) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
              }
            }

            // Calculate angles and store normalized keypoints
            const normalizedKeypoints = pose.keypoints.map((kp) => ({
              ...kp,
              x: kp.x / canvas.width,
              y: kp.y / canvas.height,
            }));

            const angles = calculateAngles(normalizedKeypoints);
            if (!angles || Object.keys(angles).length === 0) {
              throw new Error("Failed to calculate pose angles");
            }

            // Store final pose data
            setImagePoseData({
              angles,
              keypoints: normalizedKeypoints,
              imageUrl: canvas.toDataURL(),
            });
            setImageLoading(false);
          } catch (err) {
            console.error("Error processing image:", err);
            setImageError(err.message);
            setImageLoading(false);
          }
        };

        img.onerror = (err) => {
          console.error("Error loading image:", err);
          setImageError("Error loading image. Please check the URL.");
          setImageLoading(false);
        };

        img.src = imageUrl;
      } catch (err) {
        console.error("Error in image processing:", err);
        setImageError(err.message);
        setImageLoading(false);
      }
    };

    processImageFromUrl();
  }, [imageUrl, detector, modelLoading]);

  // Rest of the component remains the same...
  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
  };

  // Add angle data rendering helper
  const renderAngleData = (poseData) => {
    if (!poseData || !poseData.angles) return null;

    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Joint Angles</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(poseData.angles).map(([joint, angle]) => (
            <div
              key={joint}
              className="flex justify-between bg-white p-2 rounded"
            >
              <span className="font-medium">{joint.replace("_", " ")}:</span>
              <span>{angle.toFixed(1)}°</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Update the return statement to include webcam section
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pose Analysis System</h1>

      {modelLoading ? (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-blue-600">
            Loading pose detection model... This may take a moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Existing Image Analysis Section */}
          <div className="bg-white rounded-lg shadow p-4">
            {/* ... existing image section code ... */}
          </div>

          {/* Webcam Analysis Section */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Live Comparison</h2>
              <button
                onClick={toggleWebcam}
                disabled={!imagePoseData}
                className={`px-4 py-1 rounded ${
                  isWebcamActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white ${
                  !imagePoseData ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isWebcamActive ? "Stop Camera" : "Start Camera"}
              </button>
            </div>

            {!imagePoseData ? (
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-yellow-600">
                  Please wait for the reference pose to be processed first.
                </p>
              </div>
            ) : webcamError ? (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-600">{webcamError}</p>
              </div>
            ) : !isWebcamActive ? (
              <div
                className="bg-gray-50 p-4 rounded-lg flex items-center justify-center"
                style={{ height: "320px" }}
              >
                <p className="text-gray-600">
                  Click "Start Camera" to begin live comparison.
                </p>
              </div>
            ) : (
              <div>
                <div className="relative border rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    style={{ display: "none" }}
                    width="640"
                    height="480"
                  />
                  <canvas
                    ref={webcamCanvasRef}
                    className="w-full"
                    width="640"
                    height="480"
                  />
                </div>

                {webcamPoseData && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Pose Similarity
                      </h3>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            similarity > 80
                              ? "bg-green-500"
                              : similarity > 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${similarity}%` }}
                        />
                      </div>
                      <p className="text-right mt-1 font-medium">
                        {similarity.toFixed(1)}%
                      </p>
                    </div>

                    {renderAngleData(webcamPoseData)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectPoseAnalysis;

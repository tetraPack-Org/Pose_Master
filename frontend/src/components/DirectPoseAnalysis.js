import React, { useState, useRef, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { calculateAngles } from "./angleCalculations";

const KEYPOINT_NAMES = {
  nose: "Nose",
  left_eye: "Left Eye",
  right_eye: "Right Eye",
  left_ear: "Left Ear",
  right_ear: "Right Ear",
  left_shoulder: "Left Shoulder",
  right_shoulder: "Right Shoulder",
  left_elbow: "Left Elbow",
  right_elbow: "Right Elbow",
  left_wrist: "Left Wrist",
  right_wrist: "Right Wrist",
  left_hip: "Left Hip",
  right_hip: "Right Hip",
  left_knee: "Left Knee",
  right_knee: "Right Knee",
  left_ankle: "Left Ankle",
  right_ankle: "Right Ankle",
};

const FEEDBACK_THRESHOLDS = {
  GOOD: 10,
  MODERATE: 20,
  POOR: 30,
};

const DirectPoseAnalysis = ({ imageUrl }) => {
  // State management
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imagePoseData, setImagePoseData] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [webcamPoseData, setWebcamPoseData] = useState(null);
  const [similarity, setSimilarity] = useState(0);
  const [detector, setDetector] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [poseFeedback, setPoseFeedback] = useState([]);

  // Refs
  const imageCanvasRef = useRef(null);
  const webcamCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const requestRef = useRef(null);
  const imageRef = useRef(null);

  // Helper function for getting keypoints for joints
  const getKeypointsForJoint = (jointName, allKeypoints) => {
    const jointMap = {
      left_elbow: ["left_shoulder", "left_elbow", "left_wrist"],
      right_elbow: ["right_shoulder", "right_elbow", "right_wrist"],
      left_shoulder: ["left_shoulder", "left_elbow", "left_hip"],
      right_shoulder: ["right_shoulder", "right_elbow", "right_hip"],
      left_knee: ["left_hip", "left_knee", "left_ankle"],
      right_knee: ["right_hip", "right_knee", "right_ankle"],
      left_hip: ["left_shoulder", "left_hip", "left_knee"],
      right_hip: ["right_shoulder", "right_hip", "right_knee"],
    };

    const keypointNames = jointMap[jointName] || [];
    return allKeypoints.filter((kp) => keypointNames.includes(kp.name));
  };

  // Helper function to draw keypoint with label
  const drawKeypointWithLabel = (ctx, keypoint) => {
    if (keypoint.score > 0.3) {
      // Draw point
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "lime";
      ctx.fill();

      // Draw label
      ctx.font = "12px Arial";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      const label = KEYPOINT_NAMES[keypoint.name] || keypoint.name;
      ctx.strokeText(label, keypoint.x + 7, keypoint.y - 7);
      ctx.fillText(label, keypoint.x + 7, keypoint.y - 7);
    }
  };

  // Helper function to get feedback for joint angle difference
  const getJointFeedback = (joint, diff) => {
    if (diff <= FEEDBACK_THRESHOLDS.GOOD) {
      return { joint, message: "Good alignment", severity: "success" };
    } else if (diff <= FEEDBACK_THRESHOLDS.MODERATE) {
      return {
        joint,
        message: "Slight adjustment needed",
        severity: "warning",
      };
    } else {
      return {
        joint,
        message: `Major adjustment needed (${diff.toFixed(1)}° off)`,
        severity: "error",
      };
    }
  };

  // Model loading effect
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };
        const loadedDetector = await poseDetection.createDetector(
          model,
          detectorConfig
        );
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

  // Helper function to draw pose
  // Update the drawPose function
  const drawPose = (ctx, pose, showLabels = true) => {
    // Draw connections first so they appear behind the points
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

    // Draw limbs with gradient color
    for (const [start, end] of connections) {
      if (start?.score > 0.3 && end?.score > 0.3) {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          start.x,
          start.y,
          end.x,
          end.y
        );
        gradient.addColorStop(0, "rgba(0, 255, 0, 0.7)");
        gradient.addColorStop(1, "rgba(0, 255, 0, 0.7)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }

    // Draw keypoints with labels
    for (const keypoint of pose.keypoints) {
      if (keypoint.score > 0.3) {
        // Draw outer circle
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fill();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.fill();

        if (showLabels) {
          // Draw label background
          const label = KEYPOINT_NAMES[keypoint.name] || keypoint.name;
          ctx.font = "14px Arial";
          const textWidth = ctx.measureText(label).width;

          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fillRect(keypoint.x + 10, keypoint.y - 20, textWidth + 10, 20);

          // Draw label text
          ctx.fillStyle = "white";
          ctx.fillText(label, keypoint.x + 15, keypoint.y - 5);
        }
      }
    }
  };

  // Update the detectPose function in startDetectionLoop
  const detectPose = async () => {
    try {
      const video = videoRef.current;
      const canvas = webcamCanvasRef.current;
      const ctx = canvas.getContext("2d");

      // Clear and draw video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add semi-transparent overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const poses = await detector.estimatePoses(video);

      if (poses && poses.length > 0) {
        const pose = poses[0];
        const feedback = [];

        // Draw pose with labels
        drawPose(ctx, pose, true);

        // Calculate angles and similarity
        const normalizedKeypoints = pose.keypoints.map((kp) => ({
          ...kp,
          x: kp.x / canvas.width,
          y: kp.y / canvas.height,
        }));

        const currentAngles = calculateAngles(normalizedKeypoints);

        if (imagePoseData?.angles) {
          let totalDiff = 0;
          let countedAngles = 0;

          // Draw feedback header
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(10, 10, canvas.width - 20, 40);

          // Draw similarity score
          const similarityText = `Similarity: ${similarity.toFixed(1)}%`;
          ctx.font = "bold 24px Arial";
          ctx.fillStyle =
            similarity > 80
              ? "#00FF00"
              : similarity > 60
              ? "#FFFF00"
              : "#FF0000";
          ctx.fillText(similarityText, 20, 38);

          // Process joint angles and draw feedback
          for (const joint in imagePoseData.angles) {
            if (currentAngles[joint]) {
              const diff = Math.abs(
                imagePoseData.angles[joint] - currentAngles[joint]
              );
              totalDiff += diff;
              countedAngles++;

              const jointKeypoints = getKeypointsForJoint(
                joint,
                pose.keypoints
              );
              if (diff > FEEDBACK_THRESHOLDS.MODERATE) {
                // Draw attention circle for joints needing adjustment
                for (const kp of jointKeypoints) {
                  if (kp.score > 0.3) {
                    // Pulsing circle effect
                    const radius = 12 + Math.sin(Date.now() / 200) * 4;
                    ctx.beginPath();
                    ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
                    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                  }
                }

                // Add feedback
                feedback.push(getJointFeedback(joint, diff));
              }
            }
          }

          // Draw feedback messages
          if (feedback.length > 0) {
            const feedbackY = 70;
            ctx.font = "16px Arial";
            feedback.forEach((item, index) => {
              const y = feedbackY + index * 25;
              const text = `${KEYPOINT_NAMES[item.joint]}: ${item.message}`;

              // Draw feedback background
              ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
              const textWidth = ctx.measureText(text).width;
              ctx.fillRect(10, y - 20, textWidth + 20, 25);

              // Draw feedback text
              ctx.fillStyle =
                item.severity === "success"
                  ? "#00FF00"
                  : item.severity === "warning"
                  ? "#FFFF00"
                  : "#FF0000";
              ctx.fillText(text, 20, y);
            });
          }

          // Update similarity score
          if (countedAngles > 0) {
            const avgDiff = totalDiff / countedAngles;
            const similarityScore = Math.max(0, 100 - avgDiff * 2.5);
            setSimilarity(similarityScore);
            setPoseFeedback(feedback);
          }
        }

        setWebcamPoseData({
          angles: currentAngles,
          keypoints: normalizedKeypoints,
          feedback,
        });
      }
    } catch (err) {
      console.error("Error in pose detection loop:", err);
    }

    requestRef.current = requestAnimationFrame(detectPose);
  };

  // Webcam pose detection loop
  const startDetectionLoop = useCallback(() => {
    if (
      !detector ||
      !videoRef.current ||
      !webcamCanvasRef.current ||
      !imagePoseData
    )
      return;

    const detectPose = async () => {
      try {
        const video = videoRef.current;
        const canvas = webcamCanvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const poses = await detector.estimatePoses(video);

        if (poses && poses.length > 0) {
          const pose = poses[0];
          const feedback = [];

          // Draw pose with labels
          drawPose(ctx, pose, true);

          // Calculate angles and similarity
          const normalizedKeypoints = pose.keypoints.map((kp) => ({
            ...kp,
            x: kp.x / canvas.width,
            y: kp.y / canvas.height,
          }));

          const currentAngles = calculateAngles(normalizedKeypoints);

          if (imagePoseData?.angles) {
            let totalDiff = 0;
            let countedAngles = 0;

            for (const joint in imagePoseData.angles) {
              if (currentAngles[joint]) {
                const diff = Math.abs(
                  imagePoseData.angles[joint] - currentAngles[joint]
                );
                totalDiff += diff;
                countedAngles++;

                // Get feedback for this joint
                const jointFeedback = getJointFeedback(joint, diff);
                feedback.push(jointFeedback);

                if (diff > FEEDBACK_THRESHOLDS.MODERATE) {
                  const jointKeypoints = getKeypointsForJoint(
                    joint,
                    pose.keypoints
                  );
                  for (const kp of jointKeypoints) {
                    if (kp.score > 0.3) {
                      ctx.beginPath();
                      ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
                      ctx.strokeStyle = "#FF0000";
                      ctx.lineWidth = 3;
                      ctx.stroke();
                    }
                  }
                }
              }
            }

            if (countedAngles > 0) {
              const avgDiff = totalDiff / countedAngles;
              const similarityScore = Math.max(0, 100 - avgDiff * 2.5);
              setSimilarity(similarityScore);
              setPoseFeedback(feedback);

              // Draw similarity score
              ctx.font = "24px Arial";
              ctx.fillStyle =
                similarityScore > 80
                  ? "#00FF00"
                  : similarityScore > 60
                  ? "#FFFF00"
                  : "#FF0000";
              ctx.fillText(
                `Similarity: ${similarityScore.toFixed(1)}%`,
                10,
                30
              );

              // Draw feedback messages
              ctx.font = "16px Arial";
              feedback.forEach((item, index) => {
                ctx.fillStyle =
                  item.severity === "success"
                    ? "#00FF00"
                    : item.severity === "warning"
                    ? "#FFFF00"
                    : "#FF0000";
                ctx.fillText(
                  `${KEYPOINT_NAMES[item.joint]}: ${item.message}`,
                  10,
                  60 + index * 25
                );
              });
            }
          }

          setWebcamPoseData({
            angles: currentAngles,
            keypoints: normalizedKeypoints,
            feedback,
          });
        }
      } catch (err) {
        console.error("Error in pose detection loop:", err);
      }

      requestRef.current = requestAnimationFrame(detectPose);
    };

    detectPose();
  }, [detector, imagePoseData]);

  // Image processing effect
  useEffect(() => {
    if (!imageUrl || !detector || modelLoading) return;

    const processImage = async () => {
      setImageLoading(true);
      setImageError(null);

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async () => {
          const canvas = imageCanvasRef.current;
          if (!canvas) {
            throw new Error("Canvas reference is null");
          }

          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Failed to get canvas context");
          }

          // Draw image and detect pose
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const poses = await detector.estimatePoses(img);
          if (!poses?.length) {
            throw new Error("No pose detected in the image");
          }

          const pose = poses[0];

          // Draw pose with labels
          drawPose(ctx, pose, true);

          // Calculate and store pose data
          const normalizedKeypoints = pose.keypoints.map((kp) => ({
            ...kp,
            x: kp.x / canvas.width,
            y: kp.y / canvas.height,
          }));

          const angles = calculateAngles(normalizedKeypoints);
          if (!angles || !Object.keys(angles).length) {
            throw new Error("Failed to calculate pose angles");
          }

          setImagePoseData({
            angles,
            keypoints: normalizedKeypoints,
            imageUrl: canvas.toDataURL(),
          });
        };

        img.onerror = () => {
          setImageError("Failed to load image. Please check the URL.");
        };

        img.src = imageUrl;
      } catch (err) {
        setImageError(err.message);
      } finally {
        setImageLoading(false);
      }
    };

    processImage();
  }, [imageUrl, detector, modelLoading]);

  // Webcam setup effect
  useEffect(() => {
    const setupWebcam = async () => {
      if (isWebcamActive && detector && imagePoseData) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            webcamCanvasRef.current.width = videoRef.current.videoWidth;
            webcamCanvasRef.current.height = videoRef.current.videoHeight;

            startDetectionLoop();
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setWebcamError(`Failed to access webcam: ${err.message}`);
          setIsWebcamActive(false);
        }
      } else {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      }
    };

    setupWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isWebcamActive, detector, imagePoseData, startDetectionLoop]);

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
  };

  const renderFeedback = (feedback) => {
    if (!feedback?.length) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Pose Feedback</h3>
        <div className="space-y-2">
          {feedback.map((item, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                item.severity === "success"
                  ? "bg-green-100 text-green-800"
                  : item.severity === "warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span className="font-medium">
                {KEYPOINT_NAMES[item.joint] || item.joint}:
              </span>{" "}
              {item.message}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAngleData = (poseData) => {
    if (!poseData?.angles) return null;

    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Joint Angles</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(poseData.angles).map(([joint, angle]) => (
            <div
              key={joint}
              className="flex justify-between bg-white p-2 rounded"
            >
              <span className="font-medium">
                {KEYPOINT_NAMES[joint] || joint}:
              </span>
              <span>{angle.toFixed(1)}°</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pose Analysis System</h1>

      {modelLoading ? (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-blue-600">Loading pose detection model...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Reference Pose</h2>
            <div className="border rounded-lg overflow-hidden mb-4">
              <canvas
                ref={imageCanvasRef}
                className="w-full"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </div>
            {imageLoading && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-600">Processing image...</p>
              </div>
            )}
            {imageError && (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-600">{imageError}</p>
              </div>
            )}
            {imagePoseData && renderAngleData(imagePoseData)}
          </div>

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
                    {renderFeedback(poseFeedback)}
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

import { keypointIndices } from './angleCalculations';

/**
 * Draw pose keypoints and connections on canvas with feedback highlighting
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} keypoints - Keypoints from TensorFlow.js model
 * @param {Object} referenceAngles - Reference pose angles
 * @param {Object} currentAngles - Current pose angles
 * @returns {Array} - List of incorrect joints for feedback
 */
export const drawPoseWithFeedback = (ctx, keypoints, referenceAngles, currentAngles) => {
  if (!keypoints || keypoints.length === 0) return [];
  
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Define colors
  const GREEN = "#00FF00";
  const RED = "#FF0000";
  const YELLOW = "#FFFF00";
  
  // Threshold for considering a joint "incorrect"
  const ANGLE_THRESHOLD = 10; // degrees
  
  // Track incorrect joints for feedback
  const incorrectJoints = [];

  // First, check which joints are incorrect
  if (referenceAngles && currentAngles) {
    for (const [jointName, referenceAngle] of Object.entries(referenceAngles)) {
      if (currentAngles[jointName]) {
        let angleDiff = Math.abs(referenceAngle - currentAngles[jointName]);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        if (angleDiff > ANGLE_THRESHOLD) {
          incorrectJoints.push({
            name: jointName,
            diff: angleDiff,
            current: currentAngles[jointName],
            reference: referenceAngle
          });
        }
      }
    }
  }

  // Define connections to draw
  const connections = [
    // Torso
    [keypointIndices.left_shoulder, keypointIndices.right_shoulder], 
    [keypointIndices.right_shoulder, keypointIndices.right_hip],
    [keypointIndices.right_hip, keypointIndices.left_hip], 
    [keypointIndices.left_hip, keypointIndices.left_shoulder],
    // Arms
    [keypointIndices.left_shoulder, keypointIndices.left_elbow], 
    [keypointIndices.left_elbow, keypointIndices.left_wrist],
    [keypointIndices.right_shoulder, keypointIndices.right_elbow], 
    [keypointIndices.right_elbow, keypointIndices.right_wrist],
    // Legs
    [keypointIndices.left_hip, keypointIndices.left_knee], 
    [keypointIndices.left_knee, keypointIndices.left_ankle],
    [keypointIndices.right_hip, keypointIndices.right_knee], 
    [keypointIndices.right_knee, keypointIndices.right_ankle]
  ];

  // Create a map for quick access to keypoints
  const keypointMap = {};
  keypoints.forEach(kp => {
    keypointMap[kp.name] = kp;
  });

  // Create a map to determine if a connection should be highlighted red
  const jointConnections = {
    "right_elbow": [
      [keypointIndices.right_shoulder, keypointIndices.right_elbow],
      [keypointIndices.right_elbow, keypointIndices.right_wrist]
    ],
    "left_elbow": [
      [keypointIndices.left_shoulder, keypointIndices.left_elbow],
      [keypointIndices.left_elbow, keypointIndices.left_wrist]
    ],
    "right_shoulder": [
      [keypointIndices.right_elbow, keypointIndices.right_shoulder],
      [keypointIndices.right_shoulder, keypointIndices.right_hip]
    ],
    "left_shoulder": [
      [keypointIndices.left_elbow, keypointIndices.left_shoulder],
      [keypointIndices.left_shoulder, keypointIndices.left_hip]
    ],
    "right_hip": [
      [keypointIndices.right_shoulder, keypointIndices.right_hip],
      [keypointIndices.right_hip, keypointIndices.right_knee]
    ],
    "left_hip": [
      [keypointIndices.left_shoulder, keypointIndices.left_hip],
      [keypointIndices.left_hip, keypointIndices.left_knee]
    ],
    "right_knee": [
      [keypointIndices.right_hip, keypointIndices.right_knee],
      [keypointIndices.right_knee, keypointIndices.right_ankle]
    ],
    "left_knee": [
      [keypointIndices.left_hip, keypointIndices.left_knee],
      [keypointIndices.left_knee, keypointIndices.left_ankle]
    ]
  };

  // Check if a connection should be highlighted as incorrect
  const isConnectionIncorrect = (start, end) => {
    for (const joint of incorrectJoints) {
      const connections = jointConnections[joint.name] || [];
      for (const [connStart, connEnd] of connections) {
        if ((start === connStart && end === connEnd) || (start === connEnd && end === connStart)) {
          return true;
        }
      }
    }
    return false;
  };

  // Draw connections
  for (const [startIdx, endIdx] of connections) {
    const startKeypoint = keypoints.find(kp => kp.name === Object.keys(keypointIndices).find(key => keypointIndices[key] === startIdx));
    const endKeypoint = keypoints.find(kp => kp.name === Object.keys(keypointIndices).find(key => keypointIndices[key] === endIdx));
    
    if (startKeypoint && endKeypoint && 
        startKeypoint.score > 0.5 && endKeypoint.score > 0.5) {
      
      const isIncorrect = isConnectionIncorrect(startIdx, endIdx);
      
      ctx.beginPath();
      ctx.moveTo(startKeypoint.x * width, startKeypoint.y * height);
      ctx.lineTo(endKeypoint.x * width, endKeypoint.y * height);
      ctx.strokeStyle = isIncorrect ? RED : GREEN;
      ctx.lineWidth = isIncorrect ? 4 : 2;
      ctx.stroke();
    }
  }

  // Draw keypoints
  keypoints.forEach(keypoint => {
    if (keypoint.score > 0.5) {  // Only draw keypoints with good confidence
      ctx.beginPath();
      ctx.arc(keypoint.x * width, keypoint.y * height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = GREEN;
      ctx.fill();
    }
  });

  return incorrectJoints;
};

/**
 * Draw pose similarity text and feedback
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} similarity - Similarity score (0-100)
 * @param {Array} incorrectJoints - List of joints that need correction
 * @param {number} holdTime - How long the pose has been held (in seconds)
 * @param {boolean} poseSuccess - Whether the pose was successfully held for the required time
 */
export const drawFeedbackText = (ctx, similarity, incorrectJoints = [], holdTime = 0, poseSuccess = false) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Draw similarity score
  // ctx.font = "30px Arial";
  // ctx.fillStyle = similarity > 70 ? "#00FF00" : similarity > 50 ? "#FFA500" : "#FF0000";
  // ctx.fillText(`Similarity: ${similarity.toFixed(1)}%`, 20, 40);
  
  // Draw feedback header
  if (incorrectJoints.length > 0) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText("Feedback:", 20, 80);
    
    // Draw feedback for each incorrect joint
    ctx.font = "20px Arial";
    for (let i = 0; i < Math.min(incorrectJoints.length, 3); i++) {
      const joint = incorrectJoints[i];
      const direction = joint.current > joint.reference ? "straighten" : "bend";
      ctx.fillText(
        `• Adjust ${joint.name.replace("_", " ")}: ${direction} more`, 
        30, 
        115 + i * 30
      );
    }
    
    // If there are more than 3 incorrect joints
    if (incorrectJoints.length > 3) {
      ctx.fillText(`... and ${incorrectJoints.length - 3} more adjustments needed`, 30, 115 + 3 * 30);
    }
  } else if (similarity > 90) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#00FF00";
    if (poseSuccess) {
      ctx.fillText("You have successfully executed the pose", 20, 80);
    } else {
      ctx.fillText("You have successfully executed the pose", 20, 80);
    }
  }

  // Draw progress bar if similarity is high enough (>= 90%)
  if (similarity >= 90 && holdTime > 0) {
    // Draw progress text
    ctx.font = "24px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(`Hold pose: ${Math.min(holdTime, 3).toFixed(1)}s / 3.0s`, 20, height - 50);
    
    // Draw progress bar background
    const barWidth = width - 40;
    const barHeight = 20;
    ctx.fillStyle = "#333333";
    ctx.fillRect(20, height - 30, barWidth, barHeight);
    
    // Draw progress bar fill
    const fillWidth = Math.min(holdTime / 3, 1) * barWidth;
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(20, height - 30, fillWidth, barHeight);
  }
  
  // Draw FPS if provided
  if (window.lastFrameRate) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`FPS: ${window.lastFrameRate.toFixed(1)}`, width - 100, 30);
  }
};

/**
 * Draw success feedback when the user has successfully maintained the pose
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} holdTime - How long the pose has been held (in seconds)
 */
export const drawSuccessFeedback = (ctx, holdTime) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Draw semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, height);
  
  // Draw success message
  ctx.font = "40px Arial";
  ctx.fillStyle = "#00FF00";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Perfect Match!", width / 2, height / 2 - 50);
  
  // Draw success description
  ctx.font = "24px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`You maintained the pose for ${holdTime.toFixed(1)} seconds!`, width / 2, height / 2 + 20);
  
  // Draw instruction to continue
  ctx.font = "20px Arial";
  ctx.fillStyle = "#FFFF00";
  ctx.fillText("Press 'Try Another Pose' to continue", width / 2, height / 2 + 70);
  
  // Reset text alignment for other drawing operations
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
};
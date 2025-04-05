/**
 * Calculate angle between three points in 2D space
 * @param {Object} a - First point {x, y}
 * @param {Object} b - Middle point (vertex) {x, y}
 * @param {Object} c - Third point {x, y}
 * @returns {number} - Angle in degrees
 */
export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  
  // Convert points to vectors
  const vectorBA = {
    x: a.x - b.x,
    y: a.y - b.y
  };
  
  const vectorBC = {
    x: c.x - b.x,
    y: c.y - b.y
  };
  
  // Calculate dot product
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  
  // Calculate magnitudes
  const magnitudeBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);
  
  // Calculate angle in degrees (handle edge cases to prevent NaN)
  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return 0;
  }
  
  const cosineAngle = Math.min(Math.max(dotProduct / (magnitudeBA * magnitudeBC), -1.0), 1.0);
  const angle = Math.acos(cosineAngle) * (180.0 / Math.PI);
  
  return angle;
};

// Maps TensorFlow.js MoveNet keypoint names to their indices
export const keypointIndices = {
  nose: 0,
  left_eye: 1,
  right_eye: 2,
  left_ear: 3,
  right_ear: 4,
  left_shoulder: 5,
  right_shoulder: 6,
  left_elbow: 7,
  right_elbow: 8,
  left_wrist: 9,
  right_wrist: 10,
  left_hip: 11,
  right_hip: 12,
  left_knee: 13,
  right_knee: 14,
  left_ankle: 15,
  right_ankle: 16
};

// Define joint connections for angle calculations based on MoveNet keypoint indices
export const angleJoints = [
  // Right arm
  { indices: [6, 8, 10], name: "right_elbow" },    // right shoulder, elbow, wrist
  // Left arm
  { indices: [5, 7, 9], name: "left_elbow" },      // left shoulder, elbow, wrist
  // Shoulders
  { indices: [8, 6, 12], name: "right_shoulder" }, // right elbow, shoulder, hip
  { indices: [7, 5, 11], name: "left_shoulder" },  // left elbow, shoulder, hip
  // Hips
  { indices: [6, 12, 14], name: "right_hip" },     // right shoulder, hip, knee
  { indices: [5, 11, 13], name: "left_hip" },      // left shoulder, hip, knee
  // Knees
  { indices: [12, 14, 16], name: "right_knee" },   // right hip, knee, ankle
  { indices: [11, 13, 15], name: "left_knee" },    // left hip, knee, ankle
];

/**
 * Calculate joint angles from TensorFlow.js MoveNet keypoints
 * @param {Array} keypoints - Array of keypoints from TensorFlow.js MoveNet model
 * @returns {Object} - Map of joint names to their angles
 */
export const calculateAngles = (keypoints) => {
  if (!keypoints || keypoints.length === 0) {
    console.error("No keypoints provided to calculateAngles");
    return null;
  }
  
  // Debug keypoints
  // console.log("Calculating angles for keypoints:", keypoints);
  
  const angles = {};
  
  // For each joint configuration that we want to measure
  for (const joint of angleJoints) {
    const [aIdx, bIdx, cIdx] = joint.indices;
    
    // Get the keypoints by their indices
    const a = keypoints[aIdx];
    const b = keypoints[bIdx];
    const c = keypoints[cIdx];
    // console.log(`Keypoints for ${joint.name}:`, {
    //   a: { x: a.x, y: a.y, score: a.score },
    //   b: { x: b.x, y: b.y, score: b.score },
    //   c: { x: c.x, y: c.y, score: c.score }
    // });
    
    
    // Check if all required keypoints exist and have good confidence
    if (a && b && c && 
        a.score > 0.3 && b.score > 0.3 && c.score > 0.3) {
      
      // Debug individual keypoints
      
      const angle = calculateAngle(a, b, c);
      angles[joint.name] = angle;
      // console.log(`Angle for ${joint.name}: ${angles[joint.name]}°`);
    } else {
      console.warn(`Cannot calculate ${joint.name} angle - missing keypoints or low confidence`);
    }
  }

  // console.log("Calculated angles:", angles);
  
  // Validate we have calculated at least some angles
  if (Object.keys(angles).length === 0) {
    console.error("Failed to calculate any pose angles");
    return null;
  }
  
  return angles;
};

/**
 * Calculate similarity between reference and current pose
 * @param {Object} referenceAngles - Map of joint names to angles in reference pose
 * @param {Object} currentAngles - Map of joint names to angles in current pose
 * @returns {number} - Similarity score from 0 to 100
 */
export const calculateSimilarity = (referenceAngles, currentAngles) => {
  if (!referenceAngles || !currentAngles) {
    return 0;
  }
  
  console.log("Calculating similarity between:", { 
    referenceAngles, 
    currentAngles 
  });
  
  const commonAngles = Object.keys(referenceAngles).filter(
    joint => currentAngles.hasOwnProperty(joint)
  );
  
  if (commonAngles.length === 0) {
    console.error("No common angles found between reference and current pose");
    return 0;
  }
  
  let totalSimilarity = 0;
  
  for (const joint of commonAngles) {
    let angleDiff = Math.abs(referenceAngles[joint] - currentAngles[joint]);
    
    // Adjust for angle wrapping
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }
    
    // Convert difference to similarity (0-1 scale)
    const similarity = 1 - (angleDiff / 180);
    totalSimilarity += similarity;
    
    console.log(`${joint} difference: ${angleDiff}°, similarity: ${(similarity * 100).toFixed(1)}%`);
  }
  
  // Return average similarity as percentage
  const avgSimilarity = (totalSimilarity / commonAngles.length) * 100;
  console.log(`Overall similarity: ${avgSimilarity.toFixed(1)}%`);
  return avgSimilarity;
};
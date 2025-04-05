/**
 * Calculate angle between three points in 2D space
 * @param {Object} a - First point {x, y}
 * @param {Object} b - Middle point (vertex) {x, y}
 * @param {Object} c - Third point {x, y}
 * @returns {number} - Angle in degrees
 */
export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;

  const vectorBA = {
    x: a.x - b.x,
    y: a.y - b.y
  };

  const vectorBC = {
    x: c.x - b.x,
    y: c.y - b.y
  };

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magnitudeBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return 0;
  }

  const cosineAngle = Math.min(Math.max(dotProduct / (magnitudeBA * magnitudeBC), -1.0), 1.0);
  const angle = Math.acos(cosineAngle) * (180.0 / Math.PI);

  return angle;
};

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

export const angleJoints = [
  { indices: [6, 8, 10], name: "right_elbow" }, 
  { indices: [5, 7, 9], name: "left_elbow" }, 
  { indices: [8, 6, 12], name: "right_shoulder" }, 
  { indices: [7, 5, 11], name: "left_shoulder" }, 
  { indices: [6, 12, 14], name: "right_hip" }, 
  { indices: [5, 11, 13], name: "left_hip" }, 
  { indices: [12, 14, 16], name: "right_knee" }, 
  { indices: [11, 13, 15], name: "left_knee" }  
];

export const calculateAngles = (keypoints) => {
  if (!keypoints || keypoints.length === 0) {
    console.error("No keypoints provided to calculateAngles");
    return null;
  }

  const angles = {};

  for (const joint of angleJoints) {
    const [aIdx, bIdx, cIdx] = joint.indices;

    const a = keypoints[aIdx];
    const b = keypoints[bIdx];
    const c = keypoints[cIdx];

    if (a && b && c && a.score > 0.3 && b.score > 0.3 && c.score > 0.3) {
      const angle = calculateAngle(a, b, c);
      angles[joint.name] = angle;
    } else {
      console.warn(`Cannot calculate ${joint.name} angle - missing keypoints or low confidence`);
    }
  }

  if (Object.keys(angles).length === 0) {
    console.error("Failed to calculate any pose angles");
    return null;
  }

  return angles;
};

export const calculateSimilarity = (referenceAngles, currentAngles) => {
  if (!referenceAngles || !currentAngles) {
    return 0;
  }

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

    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }

    const similarity = 1 - (angleDiff / 180);
    totalSimilarity += similarity;
  }

  const avgSimilarity = (totalSimilarity / commonAngles.length) * 100;
  return avgSimilarity;
};
import React, { useState, useEffect } from 'react';
import WebcamCapture from './WebcamCapture';
import  './PoseComparision.css';

const PoseComparison = ({ gallery }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationInterval, setPresentationInterval] = useState(null);

  useEffect(() => {
    console.log("Gallery:", gallery);
    console.log("Current Index:", currentIndex);
    console.log("Current Reference Data:", currentReferenceData);
  }, [gallery, currentIndex]);

  const currentReferenceData = gallery.length > 0 ? gallery[currentIndex] : null;

  const goToNextImage = () => {
    if (currentIndex < gallery.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (presentationMode) {
      // In presentation mode, loop back to the beginning
      setCurrentIndex(0);
    }
  };

  const goToPrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (presentationMode) {
      // In presentation mode, loop to the end
      setCurrentIndex(gallery.length - 1);
    }
  };

  const togglePresentationMode = () => {
    if (presentationMode) {
      // Stop presentation mode
      if (presentationInterval) {
        clearInterval(presentationInterval);
        setPresentationInterval(null);
      }
      setPresentationMode(false);
    } else {
      // Start presentation mode
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          if (prevIndex < gallery.length - 1) {
            return prevIndex + 1;
          } else {
            return 0; // Loop back to beginning
          }
        });
      }, 5000); // Change image every 5 seconds
      
      setPresentationInterval(interval);
      setPresentationMode(true);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (presentationInterval) {
        clearInterval(presentationInterval);
      }
    };
  }, [presentationInterval]);

  return (
    <div className="pose-comparison">
      <h1>Real-time Pose Comparison</h1>
      <p className="description">
        Compare your pose in real-time with the reference images uploaded by the mentor.
        Navigate between different poses using the controls or enable presentation mode to cycle through them automatically.
      </p>
      
      <div className="step-container">
        <div className="step">
          <div className="step-number">1</div>
          
          {gallery.length > 0 && (
            <div className="image-navigation">
              <h3>Reference Images ({currentIndex + 1}/{gallery.length})</h3>
              <div className="navigation-controls">
                <button 
                  onClick={goToPrevImage} 
                  disabled={currentIndex === 0 && !presentationMode}
                >
                  Previous
                </button>
                <button 
                  onClick={goToNextImage} 
                  disabled={currentIndex === gallery.length - 1 && !presentationMode}
                >
                  Next
                </button>
                
                {gallery.length > 1 && (
                  <button 
                    onClick={togglePresentationMode}
                    className={`presentation-button ${presentationMode ? 'active' : ''}`}
                  >
                    {presentationMode ? 'Stop Presentation' : 'Start Presentation'}
                  </button>
                )}
              </div>
              
              {presentationMode && (
                <div className="presentation-controls">
                  <label>
                    Interval (seconds):
                    <input 
                      type="range" 
                      min="2" 
                      max="10" 
                      step="1" 
                      defaultValue="5"
                      onChange={(e) => {
                        if (presentationInterval) {
                          clearInterval(presentationInterval);
                        }
                        
                        const newInterval = setInterval(goToNextImage, parseInt(e.target.value) * 1000);
                        setPresentationInterval(newInterval);
                      }} 
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="step">
          <div className="step-number">2</div>
          {currentReferenceData && (
            <div className="reference-image-container">
              <img src={currentReferenceData.image} alt="Reference Pose" className="reference-image" />
              <WebcamCapture referenceData={currentReferenceData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoseComparison;
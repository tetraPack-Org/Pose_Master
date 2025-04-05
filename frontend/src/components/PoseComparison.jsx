import React, { useState } from 'react';
import ReferenceImageUpload from './ReferenceImageUpload';
import WebcamCapture from './WebcamCapture';
import '../styles/PoseComparison.css';

const PoseComparison = () => {
  const [referenceImages, setReferenceImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationInterval, setPresentationInterval] = useState(null);
  
  const handleReferenceSet = (data) => {
    setReferenceImages(prevImages => [...prevImages, data]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...referenceImages];
    newImages.splice(index, 1);
    setReferenceImages(newImages);
    if (currentIndex >= newImages.length && newImages.length > 0) {
      setCurrentIndex(newImages.length - 1);
    }
  };
  
  const goToNextImage = () => {
    if (currentIndex < referenceImages.length - 1) {
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
      setCurrentIndex(referenceImages.length - 1);
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
          if (prevIndex < referenceImages.length - 1) {
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
  React.useEffect(() => {
    return () => {
      if (presentationInterval) {
        clearInterval(presentationInterval);
      }
    };
  }, [presentationInterval]);

  const currentReferenceData = referenceImages.length > 0 ? referenceImages[currentIndex] : null;
  
  return (
    <div className="pose-comparison">
      <h1>Real-time Pose Comparison</h1>
      <p className="description">
        Upload reference images with poses, then use your webcam to compare your pose in real-time.
        Navigate between different poses using the controls or enable presentation mode to cycle through them automatically.
      </p>
      
      <div className="step-container">
        <div className="step">
          <div className="step-number">1</div>
          <ReferenceImageUpload onReferenceSet={handleReferenceSet} />
          
          {referenceImages.length > 0 && (
            <div className="image-navigation">
              <h3>Reference Images ({currentIndex + 1}/{referenceImages.length})</h3>
              <div className="navigation-controls">
                <button 
                  onClick={goToPrevImage} 
                  disabled={currentIndex === 0 && !presentationMode}
                >
                  Previous
                </button>
                <button 
                  onClick={goToNextImage} 
                  disabled={currentIndex === referenceImages.length - 1 && !presentationMode}
                >
                  Next
                </button>
                <button 
                  onClick={() => handleRemoveImage(currentIndex)}
                  disabled={presentationMode}
                >
                  Remove Current
                </button>
                
                {referenceImages.length > 1 && (
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
          <WebcamCapture referenceData={currentReferenceData} />
        </div>
      </div>
    </div>
  );
};

export default PoseComparison;
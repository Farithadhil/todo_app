import React, { useState, useEffect, useRef } from 'react';

const SuggestionsComponent = ({ onSuggestionClick }) => {
  const suggestions = ['அரிசி', 'கடலைப்பருப்பு', 'துவரம்பருப்பு', 'பச்சரிசி', 'சர்க்கரை', 'உப்பு', 'seven', 'eight','துவரம்பருப்பு', 'பச்சரிசி', 'சர்க்கரை', 'உப்பு', 'கடலைப்பருப்பு', 'துவரம்பருப்பு', 'பச்சரிசி', 'சர்க்கரை', 'உப்பு', 'seven', 'eight', 'பச்சரிசி', 'சர்க்கரை', 'உப்பு', 'seven', 'eight','துவரம்பருப்பு', 'பச்சரிசி', 'சர்க்கரை', 'உப்பு', 'கடலைப்பருப்பு', 'துவரம்பருப்பு', 'பச்சரிசி', 'சர்க்கரை', 'உப்பு', 'seven', 'eight'];
  
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(moveRight, 5000); // Auto-scroll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${startIndex * 120}px)`;
    }
  }, [startIndex]);

  const moveRight = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
  };

  const moveLeft = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
  };

  return (
    <div className="suggestions-container mb-4">
      <button onClick={moveLeft} className="scroll-button left">
        &lt;
      </button>
      <div className="suggestions-wrapper">
        <div ref={containerRef} className="suggestions-slider">
          {suggestions.concat(suggestions.slice(0, 5)).map((item, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => onSuggestionClick(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <button onClick={moveRight} className="scroll-button right">
        &gt;
      </button>
      <style jsx>{`
        .suggestions-container {
          position: relative;
          overflow: hidden;
          padding: 10px 40px;
        }
        .suggestions-wrapper {
          overflow: hidden;
        }
        .suggestions-slider {
          display: flex;
          transition: transform 0.5s ease;
        }
        .suggestion-item {
          flex: 0 0 auto;
          background-color: #1f2937;
          color: #bdbdbd;
          border-radius: 20px;
          padding: 5px 8px;
          margin: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          white-space: nowrap;
          
          text-align: center;
        }
        .suggestion-item:hover {
          background-color: #e0e0e0;
          color: #1f2937;
        }
        .scroll-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1;
        }
        .scroll-button.left {
          left: 5px;
        }
        .scroll-button.right {
          right: 5px;
        }
      `}</style>
    </div>
  );
};

export default SuggestionsComponent;
import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle ${theme}`}
        onClick={onToggle}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="toggle-track">
          <div className="toggle-thumb">
            <span className="toggle-icon">
              {theme === 'dark' ? (
                // give credit for stackoverflow here //
                // Flipped mask-based crescent moon SVG for dark mode (black crescent on white background)
                <svg viewBox="-6 -6 12 12" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <mask id="earth-flip">
                      <rect fill="white" x="-5" y="-5" width="10" height="10"></rect>
                      <circle fill="black" cx="-3.141592654" r="5"/>
                    </mask>
                  </defs>
                  <circle r="5" fill="#1F2937" mask="url(#earth-flip)" transform="rotate(23.5)"/>
                </svg>
              ) : (
                // Circle SVG for light mode (white circle on black background)
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" fill="#fff" />
                </svg>
              )}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;

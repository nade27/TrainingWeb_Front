import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <style>
        {`
          @keyframes spinner-border {
            to { transform: rotate(360deg); }
          }
          .spinner-border {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            vertical-align: -0.125em;
            border: 0.25em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: 0.75s linear infinite spinner-border;
          }
        `}
      </style>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

// Helper class for screen readers, can be in a global CSS file too
// .visually-hidden {
//   position: absolute !important;
//   height: 1px;
//   width: 1px;
//   overflow: hidden;
//   clip: rect(1px, 1px, 1px, 1px);
//   white-space: nowrap; /* added */
// } 
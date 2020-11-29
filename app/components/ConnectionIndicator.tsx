import React from 'react';

const ConnectionIndicator = ({
  connected,
  standbyMessage,
  successMessage,
}: {
  connected: boolean;
  standbyMessage: string;
  successMessage: string;
}) => {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: 10,
          bottom: 10,
          zIndex: 10,
          borderRadius: 5,
          padding: '2px 8px',
          backgroundColor: 'lightgrey',
          boxShadow: '2px 2px 2px #888888',
        }}
      >
        {connected ? (
          <>
            <i className="fas fa-network-wired has-text-success" />{' '}
            {successMessage}
          </>
        ) : (
          <>
            <i className="fas fa-network-wired fade-in-out" /> {standbyMessage}
          </>
        )}
      </div>
      <style>{`
        .fade-in-out {
          opacity: 1;
          animation: flickerAnimation 2s infinite;
        }

        @keyframes flickerAnimation {
          0%   { opacity:1; }
          50%  { opacity:0; }
          100% { opacity:1; }
        }

      `}</style>
    </>
  );
};

export default ConnectionIndicator;

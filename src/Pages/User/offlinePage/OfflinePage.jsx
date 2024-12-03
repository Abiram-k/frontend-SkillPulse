import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const PixelButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-green-500 text-white font-bold text-lg uppercase tracking-wider border-b-4 border-green-700 hover:bg-green-400 active:border-b-0 active:border-t-4 active:border-green-800 transition-all duration-100"
  >
    {children}
  </button>
);

const PixelBox = ({ children }) => (
  <div className="bg-gray-800 p-6 border-4 border-gray-700 shadow-lg">
    {children}
  </div>
);

export default function OfflinePage() {
    
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     setIsOnline(navigator.onLine);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    window.location.reload();
  };

//   if (isOnline) {
//     return null;
//   }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <PixelBox>
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-red-500 mb-4 uppercase tracking-wide">Game Over</h1>
          <WifiOff className="w-16 h-16 mx-auto text-yellow-400" />
          <p className="text-green-400 text-xl">Connection Lost!</p>
          <p className="text-white">Your internet connection was defeated by the final boss.</p>
          <div className="mt-6 space-y-4">
            <p className="text-gray-400">Retry attempts: {retryCount}</p>
            <PixelButton onClick={handleRetry}>
              Retry Level
            </PixelButton>
          </div>
          <div className="mt-8 text-gray-500 text-sm">
            <p>Tip: Check your Wi-Fi connection or contact your ISP for support.</p>
          </div>
        </div>
      </PixelBox>
    </div>
  );
}


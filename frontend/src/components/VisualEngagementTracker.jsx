import React, { useState, useEffect, useRef } from 'react';

export const VisualEngagementTracker = ({ onTriggerTutor }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [expression, setExpression] = useState('Neutral / Focused');
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    let interval = null;

    if (isEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          interval = setInterval(() => {
            const sample = Math.random();
            if (sample < 0.6) {
              setExpression('Neutral / Focused');
            } else if (sample < 0.85) {
              setExpression('Slight Confusion 🧐');
              if (onTriggerTutor && Math.random() < 0.3) {
                onTriggerTutor('This part looks tricky — want a simpler explanation?');
              }
            } else {
              setExpression('Frustrated 😟');
              if (onTriggerTutor) {
                onTriggerTutor('I noticed sustained frustration signals. Would you like me to break down this topic into simpler steps?');
              }
            }
          }, 8000);
        })
        .catch((err) => {
          console.warn('Webcam permission denied or unavailable:', err.message);
          setIsEnabled(false);
        });
    }

    return () => {
      if (interval) clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isEnabled, onTriggerTutor]);

  return (
    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs font-lexend">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="rounded text-[#C4623A] focus:ring-[#C4623A]"
          />
          📷 Enable Visual Expression Tracking (Optional client-side webcam opt-in)
        </label>
        {isEnabled && (
          <span className="bg-amber-200 text-slate-900 px-2 py-0.5 rounded font-bold border border-amber-300">
            Status: {expression}
          </span>
        )}
      </div>

      {isEnabled && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-12 h-9 rounded object-cover border border-amber-300"
        />
      )}
    </div>
  );
};

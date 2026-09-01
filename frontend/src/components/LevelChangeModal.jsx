import React from 'react';

export const LevelChangeModal = ({ isOpen, onClose, previousLevel, newLevel, engagementNote }) => {
  if (!isOpen) return null;

  const isUpgrade =
    (previousLevel === 'easy' && (newLevel === 'medium' || newLevel === 'hard')) ||
    (previousLevel === 'medium' && newLevel === 'hard');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="text-4xl mb-3">{isUpgrade ? '🚀' : '💡'}</div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {isUpgrade ? 'Level Up!' : 'Adaptive Adjustment'}
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Your adaptive path has transitioned from <span className="font-semibold capitalize text-indigo-600">{previousLevel}</span> to{' '}
          <span className="font-semibold capitalize text-indigo-600">{newLevel}</span> tier.
        </p>

        {engagementNote && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-4 text-left">
            <span className="font-semibold">Engagement Notice:</span> {engagementNote}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          Continue to Next Adaptive Lesson
        </button>
      </div>
    </div>
  );
};

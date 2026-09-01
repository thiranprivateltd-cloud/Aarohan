import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const LearningProfileSetup = () => {
  const [formData, setFormData] = useState({
    language: 'en',
    learningStyle: 'visual',
    accessibilityPrefs: {
      screenReader: false,
      highContrast: false,
      captions: true,
    },
    pace: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckbox = (e) => {
    setFormData({
      ...formData,
      accessibilityPrefs: {
        ...formData.accessibilityPrefs,
        [e.target.name]: e.target.checked,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/profile', formData);
      navigate('/baseline');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow border border-slate-100 mt-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Configure Your Learning Profile</h2>
      <p className="text-slate-500 text-sm mb-6">Personalize your learning language, style, and accessibility settings.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Instruction Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm font-medium"
          >
            <option value="en">English</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="te">Telugu (తెలుగు)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Learning Style</label>
          <div className="grid grid-cols-3 gap-3">
            {['visual', 'auditory', 'kinesthetic'].map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setFormData({ ...formData, learningStyle: style })}
                className={`py-2 px-3 text-sm rounded-md border text-center capitalize font-medium ${
                  formData.learningStyle === style
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Accessibility Preferences</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="screenReader"
                checked={formData.accessibilityPrefs.screenReader}
                onChange={handleCheckbox}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Screen Reader Support
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="highContrast"
                checked={formData.accessibilityPrefs.highContrast}
                onChange={handleCheckbox}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              High Contrast Theme
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="captions"
                checked={formData.accessibilityPrefs.captions}
                onChange={handleCheckbox}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Multilingual Subtitles / Voice Speech
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Pacing</label>
          <select
            value={formData.pace}
            onChange={(e) => setFormData({ ...formData, pace: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="relaxed">Relaxed (Gradual advancement)</option>
            <option value="medium">Standard (Balanced adaptive progression)</option>
            <option value="accelerated">Accelerated (Fast-track challenges)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition"
        >
          {loading ? 'Saving Profile...' : 'Save & Continue to Baseline Assessment'}
        </button>
      </form>
    </div>
  );
};

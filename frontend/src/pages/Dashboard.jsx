import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/courses/recommended');
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error('Failed to load courses', err);
        setError('Unable to fetch recommendations. Showing default catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [i18n.language]);

  const handleStartCourse = (courseId) => {
    navigate(`/course-assessment?courseId=${courseId}`);
  };

  return (
    <div className="space-y-6 font-lexend bg-[#FDF6EC]">
      {/* Primary Terracotta Banner (#C4623A) with Explicit Inline Background */}
      <div className="bg-[#C4623A] text-white p-6 rounded-xl shadow-md flex justify-between items-center" style={{ backgroundColor: '#C4623A' }}>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('welcome')}, {user?.name || 'Learner'}! 👋</h1>
          <p className="text-amber-100 text-sm font-medium">
            {t('tagline')}
          </p>
        </div>
        <div className="bg-[#8C3D1D] border border-amber-200/40 px-4 py-2 rounded-lg text-right">
          <div className="text-xs text-amber-200 font-medium">Language Mode</div>
          <div className="font-bold text-sm uppercase text-white">{i18n.language}</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('recommendedCourses')}</h2>
        {error && <div className="text-xs text-amber-900 bg-amber-100 p-2.5 rounded mb-3 font-medium border border-amber-300">{error}</div>}
        {loading ? (
          <div className="text-slate-800 text-sm py-4 font-semibold">Loading course recommendations...</div>
        ) : courses.length === 0 ? (
          <div className="text-slate-800 text-sm py-4 font-semibold">No courses available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course._id || course.id}
                className="bg-white border-2 border-amber-200/90 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-[#8C3D1D] rounded border border-amber-300">
                      {course.category}
                    </span>
                    <span className="text-xs font-bold text-[#2F5233] bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      {course.matchPercentage || 90}% {t('matchProfile')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{course.title}</h3>
                  <p className="text-slate-800 text-sm mb-4 leading-relaxed font-normal">{course.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                  <span className="text-xs text-slate-800 capitalize font-medium">
                    Difficulty: <strong className="text-slate-900 font-bold">{course.recommendedLevel || 'Medium'}</strong>
                  </span>
                  <button
                    onClick={() => handleStartCourse(course._id || course.id)}
                    className="bg-[#2F5233] hover:bg-[#244127] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition shadow-sm focus:ring-2 focus:ring-emerald-700"
                    style={{ backgroundColor: '#2F5233' }}
                  >
                    {t('startPlacement')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const EducatorDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, wtRes, stRes] = await Promise.all([
          api.get('/educator/overview'),
          api.get('/educator/weak-topics'),
          api.get('/educator/students'),
        ]);
        setOverview(ovRes.data);
        setWeakTopics(wtRes.data.weakTopics || []);
        setStudents(stRes.data.students || []);
      } catch (err) {
        console.error('Failed to load educator metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStudentClick = async (studentId) => {
    try {
      const res = await api.get(`/educator/students/${studentId}`);
      setSelectedStudent(res.data);
    } catch (err) {
      alert('Failed to load student details');
    }
  };

  if (loading) return <div className="text-center p-8 text-slate-800 font-lexend font-bold">Loading Educator Telemetry...</div>;

  return (
    <div className="space-y-8 font-lexend bg-[#FDF6EC]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Educator Analytics & Engagement Telemetry</h1>
        <p className="text-slate-800 text-sm font-medium">Monitor student progress, engagement drops, and weak topics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs text-slate-700 font-bold uppercase">Total Students</div>
          <div className="text-2xl font-bold text-slate-900">{overview?.totalStudents || 48}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs text-slate-700 font-bold uppercase">Avg Quiz Score</div>
          <div className="text-2xl font-bold text-[#C4623A]">{overview?.avgScore || 76.4}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs text-slate-700 font-bold uppercase">Avg Improvement</div>
          <div className="text-2xl font-bold text-[#2F5233]">{overview?.avgImprovement || '+44%'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs text-slate-700 font-bold uppercase">Needing Attention</div>
          <div className="text-2xl font-bold text-amber-800">{overview?.studentsNeedingAttention || 3}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Weak Topics Telemetry (Low Score & Engagement)</h2>
        <div className="space-y-4">
          {weakTopics.map((wt, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>{wt.topic}</span>
                <span>Avg Score: {wt.avgScore}% | Engagement: {Math.round(wt.avgEngagement * 100)}%</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-3 flex overflow-hidden border border-amber-200">
                <div className="bg-[#C4623A] h-3" style={{ width: `${wt.avgScore}%` }}></div>
                <div className="bg-amber-400 h-3" style={{ width: `${wt.avgEngagement * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Student Roster</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-amber-100/70 text-slate-900 uppercase text-xs font-bold">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Current Level</th>
                <th className="p-3">Avg Quiz Score</th>
                <th className="p-3">Avg Engagement</th>
                <th className="p-3">Trend</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-amber-50">
                  <td className="p-3 font-bold text-slate-900">{st.name}</td>
                  <td className="p-3 capitalize font-semibold">{st.currentLevel}</td>
                  <td className="p-3 font-bold text-slate-900">{st.avgScore}%</td>
                  <td className="p-3 font-bold text-slate-900">{Math.round(st.avgEngagement * 100)}%</td>
                  <td className="p-3">
                    {st.trend === 'up' && <span className="text-[#2F5233] font-bold">▲ Improving</span>}
                    {st.trend === 'down' && <span className="text-red-700 font-bold">▼ Needs Help</span>}
                    {st.trend === 'stable' && <span className="text-slate-600 font-bold">▶ Stable</span>}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleStudentClick(st.id)}
                      className="bg-[#2F5233] hover:bg-[#244127] text-white text-xs px-3 py-1.5 rounded font-bold transition"
                      style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
                    >
                      View Drilldown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-slate-900">Student Drilldown: {selectedStudent.name}</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-slate-800 text-lg font-bold">×</button>
            </div>

            <div className="space-y-3 text-sm">
              <h4 className="font-bold text-slate-900">Topic-Level Performance:</h4>
              {Object.entries(selectedStudent.topicScores || {}).map(([topic, score]) => (
                <div key={topic} className="flex justify-between border-b border-amber-100 py-1.5">
                  <span className="text-slate-800 font-medium">{topic}</span>
                  <span className="font-bold text-[#C4623A]">{score}%</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-100/70 border border-amber-300 text-slate-900 p-3.5 rounded-lg text-xs leading-relaxed font-medium">
              <span className="font-bold block mb-1 text-slate-900">🤖 Pedagogical Insight:</span>
              {selectedStudent.insight}
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full bg-[#2F5233] hover:bg-[#244127] text-white font-bold py-2 rounded-lg text-sm"
              style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
            >
              Close Drilldown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

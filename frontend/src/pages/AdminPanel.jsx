import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Programming');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || submitting) return;
    setSubmitting(true);

    try {
      await api.post('/admin/courses', {
        title: title.trim(),
        category,
        description: description.trim(),
        recommendedLevel: 'Medium',
        order: courses.length + 1,
      });

      setTitle('');
      setDescription('');
      fetchCourses();
    } catch (err) {
      console.error('Create course error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (err) {
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== id));
    }
  };

  if (loading) return <div className="text-center p-8 text-slate-900 font-lexend font-bold">Loading Admin Panel...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-lexend bg-[#FDF6EC]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel - Course & Content Management</h1>
        <p className="text-slate-800 text-sm font-medium">Manage educational courses and lesson structures across Aarohan.</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Add New Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">Course Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm text-slate-900 bg-amber-50/50 focus:ring-2 focus:ring-[#C4623A] focus:outline-none font-medium"
              placeholder="e.g. Advanced Quantum Computing"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm text-slate-900 bg-amber-50/50 focus:ring-2 focus:ring-[#C4623A] focus:outline-none font-medium"
            >
              <option value="Programming">Programming</option>
              <option value="AI & Data">AI & Data</option>
              <option value="Mathematics">Mathematics</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm text-slate-900 bg-amber-50/50 focus:ring-2 focus:ring-[#C4623A] focus:outline-none font-medium"
            placeholder="Short course summary..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2F5233] hover:bg-[#244127] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition shadow-sm focus:ring-2 focus:ring-emerald-700"
          style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
        >
          {submitting ? 'Adding Course...' : 'Add Course'}
        </button>
      </form>

      <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Existing Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-amber-100/70 text-slate-900 uppercase text-xs font-bold">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {courses.map((c) => (
                <tr key={c._id || c.id} className="hover:bg-amber-50">
                  <td className="p-3 font-bold text-slate-900">{c.title}</td>
                  <td className="p-3 font-medium text-slate-800">{c.category}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(c._id || c.id)}
                      className="bg-red-100 text-red-800 hover:bg-red-200 text-xs px-3 py-1 rounded font-bold transition border border-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
